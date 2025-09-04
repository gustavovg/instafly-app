import { supabase, db } from './supabaseClient';


// Função para buscar perfil do Instagram usando API externa
export const getInstagramProfile = async (params) => {
  try {
    // Chama Edge Function do Supabase para buscar perfil do Instagram
    const { data, error } = await supabase.functions.invoke('get-instagram-profile', {
      body: { username: params.username }
    });

    if (error) throw error;

    return {
      data: data,
      status: 200
    };
  } catch (error) {
    console.warn('getInstagramProfile error, using fallback:', error);
    return {
      data: {
        username: params.username || 'error_user',
        followers: 0,
        following: 0,
        posts: 0,
        profile_pic: 'https://via.placeholder.com/150',
        bio: 'Profile temporarily unavailable',
        is_private: true,
        is_verified: false,
        error: 'Service temporarily unavailable'
      },
      status: 500,
      error: error
    };
  }
};

// Função para calcular custo do serviço baseado na tabela services
export const getServiceCost = async (params) => {
  try {
    const { data: service, error } = await db.services
      .select('price_per_1000, min_quantity, max_quantity')
      .eq('id', params.serviceId)
      .single();

    if (error) throw error;

    const quantity = params.quantity || 1000;
    const cost = (service.price_per_1000 / 1000) * quantity;

    return {
      data: {
        cost: parseFloat(cost.toFixed(2)),
        currency: 'BRL',
        service_id: params.serviceId,
        quantity: quantity,
        price_per_1000: service.price_per_1000
      },
      status: 200
    };
  } catch (error) {
    console.warn('getServiceCost error, using fallback:', error);
    return {
      data: {
        cost: 10.00,
        currency: 'BRL',
        service_id: params.serviceId
      },
      status: 200
    };
  }
};

// Função para processar pedido usando Supabase
export const processOrder = async (params) => {
  try {
    // Criar pedido na tabela orders
    const { data: order, error: orderError } = await db.orders
      .insert({
        user_id: params.userId,
        service_id: params.serviceId,
        link: params.link,
        quantity: params.quantity,
        charge: params.charge,
        status: 'pending',
        start_count: params.startCount || 0
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Chamar Edge Function para processar o pedido externamente
    const { data: processResult, error: processError } = await supabase.functions.invoke('process-order', {
      body: { 
        orderId: order.id,
        serviceId: params.serviceId,
        link: params.link,
        quantity: params.quantity
      }
    });

    if (processError) {
      // Atualizar status do pedido para erro
      await db.orders.update({ status: 'error' }).eq('id', order.id);
      throw processError;
    }

    // Atualizar pedido com informações do processamento
    await db.orders.update({ 
      status: 'processing',
      external_id: processResult.external_id 
    }).eq('id', order.id);

    return {
      data: {
        success: true,
        order_id: order.id,
        status: 'processing',
        external_id: processResult.external_id
      },
      status: 200
    };
  } catch (error) {
    console.warn('processOrder error:', error);
    return {
      data: {
        success: false,
        error: 'Order processing failed'
      },
      status: 500
    };
  }
};

// Função para criar pagamento usando Mercado Pago via Edge Function
export const createPayment = async (params) => {
  try {
    // Chamar Edge Function do Supabase para criar pagamento no Mercado Pago
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: {
        amount: params.amount,
        description: params.description,
        userId: params.userId,
        orderId: params.orderId,
        email: params.email
      }
    });

    if (error) throw error;

    return {
      data: {
        success: true,
        payment_id: data.payment_id,
        status: data.status,
        qr_code: data.qr_code,
        payment_url: data.payment_url,
        qr_code_base64: data.qr_code_base64
      },
      status: 200
    };
  } catch (error) {
    console.warn('createPayment error:', error);
    return {
      data: {
        success: false,
        error: 'Payment service temporarily unavailable'
      },
      status: 500,
      error: error
    };
  }
};

// Função para processar webhook do Mercado Pago
export const webhookMercadoPago = async (params) => {
  try {
    // Chamar Edge Function para processar webhook do Mercado Pago
    const { data, error } = await supabase.functions.invoke('webhook-mercadopago', {
      body: {
        type: params.type,
        data: params.data,
        id: params.id
      }
    });

    if (error) throw error;

    return {
      data: {
        success: true,
        processed: true,
        payment_status: data.payment_status,
        order_updated: data.order_updated
      },
      status: 200
    };
  } catch (error) {
    console.warn('webhookMercadoPago error:', error);
    return {
      data: {
        success: false,
        error: 'Webhook processing failed'
      },
      status: 500
    };
  }
};

// Função para sincronizar status dos pedidos
export const syncOrderStatus = async (params) => {
  try {
    // Buscar pedidos pendentes ou em processamento
    const { data: orders, error: ordersError } = await db.orders
      .select('*')
      .in('status', ['pending', 'processing', 'in_progress'])
      .not('external_id', 'is', null);

    if (ordersError) throw ordersError;

    let syncedCount = 0;

    // Chamar Edge Function para sincronizar cada pedido
    for (const order of orders) {
      try {
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-order-status', {
          body: {
            orderId: order.id,
            externalId: order.external_id
          }
        });

        if (!syncError && syncResult.updated) {
          syncedCount++;
        }
      } catch (syncError) {
        console.warn(`Failed to sync order ${order.id}:`, syncError);
      }
    }

    return {
      data: {
        success: true,
        synced_orders: syncedCount,
        total_orders: orders.length
      },
      status: 200
    };
  } catch (error) {
    console.warn('syncOrderStatus error:', error);
    return {
      data: {
        success: false,
        error: 'Sync failed'
      },
      status: 500
    };
  }
};

// Função para sincronização automática de pedidos
export const autoSyncOrders = async (params) => {
  try {
    // Buscar pedidos que precisam ser sincronizados
    const { data: orders, error } = await db.orders
      .select('*')
      .in('status', ['pending', 'processing'])
      .lt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutos atrás

    if (error) throw error;

    let syncedCount = 0;
    for (const order of orders) {
      try {
        await syncOrderStatus({ orderId: order.id });
        syncedCount++;
      } catch (syncError) {
        console.warn(`Erro ao sincronizar pedido ${order.id}:`, syncError);
      }
    }

    return {
      data: {
        success: true,
        synced_orders: syncedCount,
        message: `${syncedCount} pedidos sincronizados`
      },
      status: 200
    };
  } catch (error) {
    console.warn('autoSyncOrders error:', error);
    return {
      data: {
        success: false,
        error: 'Auto sync failed'
      },
      status: 500
    };
  }
};

// Função para enviar mensagem WhatsApp
export const sendWhatsApp = async (params) => {
  try {
    // Chamar Edge Function para enviar WhatsApp
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        to: params.to,
        message: params.message,
        templateId: params.templateId,
        variables: params.variables
      }
    });

    if (error) throw error;

    return {
      data: {
        success: true,
        message_id: data.message_id,
        status: data.status
      },
      status: 200
    };
  } catch (error) {
    console.warn('sendWhatsApp error:', error);
    return {
      data: {
        success: false,
        error: 'WhatsApp service temporarily unavailable'
      },
      status: 500
    };
  }
};

// Função para validar cupom de desconto
export const validateCoupon = async (params) => {
  try {
    const { data: coupon, error } = await db.coupons
      .select('*')
      .eq('code', params.code)
      .eq('is_active', true)
      .single();

    if (error) {
      return {
        data: {
          valid: false,
          error: 'Cupom não encontrado'
        },
        status: 200
      };
    }

    // Verificar se o cupom ainda é válido
    const now = new Date();
    const expiresAt = new Date(coupon.expires_at);

    if (expiresAt < now) {
      return {
        data: {
          valid: false,
          error: 'Cupom expirado'
        },
        status: 200
      };
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return {
        data: {
          valid: false,
          error: 'Cupom esgotado'
        },
        status: 200
      };
    }

    return {
      data: {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          min_amount: coupon.min_amount
        }
      },
      status: 200
    };
  } catch (error) {
    console.warn('validateCoupon error:', error);
    return {
      data: {
        valid: false,
        error: 'Erro na validação do cupom'
      },
      status: 500,
      error: error
    };
  }
};

// Função para obter chave VAPID para push notifications
export const getVapidKey = async (params) => {
  try {
    // Buscar chave VAPID das configurações
    const { data: setting, error } = await db.from('settings')
      .select('value')
      .eq('key', 'vapid_public_key')
      .single();

    if (error) throw error;

    return {
      data: {
        vapid_key: setting.value
      },
      status: 200
    };
  } catch (error) {
    console.warn('getVapidKey error:', error);
    return {
      data: {
        error: 'VAPID key service temporarily unavailable'
      },
      status: 500
    };
  }
};

// Função para salvar subscription de push notification
export const savePushSubscription = async (params) => {
  try {
    const { data, error } = await db.push_subscriptions
      .upsert({
        user_id: params.userId,
        endpoint: params.subscription.endpoint,
        p256dh: params.subscription.keys.p256dh,
        auth: params.subscription.keys.auth,
        user_agent: params.userAgent || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      data: {
        success: true,
        subscription_saved: true,
        id: data.id
      },
      status: 200
    };
  } catch (error) {
    console.warn('savePushSubscription error:', error);
    return {
      data: {
        success: false,
        error: 'Push subscription save failed'
      },
      status: 500
    };
  }
};

// Função para enviar notificação push
export const sendPushNotification = async (params) => {
  try {
    // Chamar Edge Function para enviar push notification
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId: params.userId,
        title: params.title,
        body: params.body,
        icon: params.icon,
        badge: params.badge,
        data: params.data
      }
    });

    if (error) throw error;

    return {
      data: {
        success: true,
        notification_sent: true,
        sent_count: data.sent_count || 0
      },
      status: 200
    };
  } catch (error) {
    console.warn('sendPushNotification error:', error);
    return {
      data: {
        success: false,
        error: 'Push notification send failed'
      },
      status: 500
    };
  }
};

