import { supabase, db, auth } from './supabaseClient';
import './entities-fix.js'; // Importar correções de compatibilidade

// Supabase Database Entities
// Cada entidade agora usa o cliente Supabase diretamente

export const Order = {
  // Buscar todos os pedidos do usuário
  findMany: async (filters = {}) => {
    let query = db.orders.select('*, services(*), users(*)');
    
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = '-created_at', limit = null) => {
    try {
      let query = db.from('orders').select('*, services(*)');
      
      if (orderBy.startsWith('-')) {
        query = query.order(orderBy.substring(1), { ascending: false });
      } else {
        query = query.order(orderBy);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Order.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = '-created_at') => {
    try {
      let query = db.from('orders').select('*, services(*)');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      if (orderBy.startsWith('-')) {
        query = query.order(orderBy.substring(1), { ascending: false });
      } else {
        query = query.order(orderBy);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Order.filter error:', error);
      return [];
    }
  },
  
  // Criar novo pedido
  create: async (orderData) => {
    const { data, error } = await db.orders.insert(orderData).select().single();
    return { data, error };
  },
  
  // Atualizar pedido
  update: async (id, updates) => {
    const { data, error } = await db.orders.update(updates).eq('id', id).select().single();
    return { data, error };
  },
  
  // Buscar por ID
  findById: async (id) => {
    const { data, error } = await db.orders.select('*, services(*), users(*)').eq('id', id).single();
    return { data, error };
  }
};

export const Settings = {
  // Buscar todas as configurações
  findMany: async () => {
    const { data, error } = await db.from('settings').select('*');
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async () => {
    try {
      const { data, error } = await db.from('settings').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Settings.list error:', error);
      return [];
    }
  },
  
  // Buscar configuração por chave
  findByKey: async (key) => {
    const { data, error } = await db.from('settings').select('*').eq('key', key).single();
    return { data, error };
  },
  
  // Atualizar configuração
  update: async (key, value) => {
    const { data, error } = await db.from('settings')
      .upsert({ key, value })
      .select()
      .single();
    return { data, error };
  }
};

export const Service = {
  // Buscar todos os serviços ativos
  findMany: async (filters = {}) => {
    let query = db.services.select('*').eq('is_active', true);
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }
    
    const { data, error } = await query.order('name');
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'name') => {
    try {
      const { data, error } = await db.from('services').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Service.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = 'name') => {
    try {
      let query = db.from('services').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query.order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Service.filter error:', error);
      return [];
    }
  },
  
  // Buscar por ID
  findById: async (id) => {
    const { data, error } = await db.services.select('*').eq('id', id).single();
    return { data, error };
  }
};

export const WhatsAppTemplate = {
  findMany: async () => {
    const { data, error } = await db.whatsapp_templates.select('*').eq('is_active', true);
    return { data, error };
  },
  
  create: async (templateData) => {
    const { data, error } = await db.whatsapp_templates.insert(templateData).select().single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('whatsapp_templates').select('*').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('WhatsAppTemplate.list error:', error);
      return [];
    }
  }
};

export const Coupon = {
  // Validar cupom
  validate: async (code) => {
    const { data, error } = await db.coupons
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    return { data, error };
  },
  
  findMany: async () => {
    const { data, error } = await db.coupons.select('*').order('created_at', { ascending: false });
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('coupons').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Coupon.list error:', error);
      return [];
    }
  }
};

export const PushSubscription = {
  create: async (subscriptionData) => {
    const { data, error } = await db.push_subscriptions.insert(subscriptionData).select().single();
    return { data, error };
  },
  
  findByUserId: async (userId) => {
    const { data, error } = await db.push_subscriptions.select('*').eq('user_id', userId);
    return { data, error };
  }
};

export const Affiliate = {
  findByUserId: async (userId) => {
    const { data, error } = await db.affiliates.select('*').eq('user_id', userId).single();
    return { data, error };
  },
  
  create: async (affiliateData) => {
    const { data, error } = await db.affiliates.insert(affiliateData).select().single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('affiliates').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Affiliate.list error:', error);
      return [];
    }
  }
};

export const AffiliateEarning = {
  findByAffiliateId: async (affiliateId) => {
    const { data, error } = await db.affiliate_earnings
      .select('*, orders(*)')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('affiliate_earnings').select('*, orders(*)').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('AffiliateEarning.list error:', error);
      return [];
    }
  }
};

export const CustomerWallet = {
  findByUserId: async (userId) => {
    const { data, error } = await db.customer_wallets.select('*').eq('user_id', userId).single();
    return { data, error };
  },
  
  updateBalance: async (userId, balance) => {
    const { data, error } = await db.customer_wallets
      .update({ balance })
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('customer_wallets').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('CustomerWallet.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = 'created_at') => {
    try {
      let query = db.from('customer_wallets').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query.order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('CustomerWallet.filter error:', error);
      return [];
    }
  }
};

export const WalletTransaction = {
  create: async (transactionData) => {
    const { data, error } = await db.wallet_transactions.insert(transactionData).select().single();
    return { data, error };
  },
  
  findByUserId: async (userId) => {
    const { data, error } = await db.wallet_transactions
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('wallet_transactions').select('*').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('WalletTransaction.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = 'created_at') => {
    try {
      let query = db.from('wallet_transactions').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query.order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('WalletTransaction.filter error:', error);
      return [];
    }
  }
};

export const SubscriptionPlan = {
  findMany: async () => {
    const { data, error } = await db.from('subscription_plans').select('*').order('price');
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'price') => {
    try {
      const { data, error } = await db.from('subscription_plans').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('SubscriptionPlan.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = 'price') => {
    try {
      let query = db.from('subscription_plans').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query.order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('SubscriptionPlan.filter error:', error);
      return [];
    }
  }
};

export const CustomerSubscription = {
  findByUserId: async (userId) => {
    const { data, error } = await db.customer_subscriptions
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('customer_subscriptions').select('*, subscription_plans(*)').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('CustomerSubscription.list error:', error);
      return [];
    }
  }
};

export const Ticket = {
  findByUserId: async (userId) => {
    const { data, error } = await db.tickets
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  create: async (ticketData) => {
    const { data, error } = await db.tickets.insert(ticketData).select().single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('tickets').select('*').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ticket.list error:', error);
      return [];
    }
  }
};

export const TicketMessage = {
  findByTicketId: async (ticketId) => {
    const { data, error } = await db.ticket_messages
      .select('*, users(*)')
      .eq('ticket_id', ticketId)
      .order('created_at');
    return { data, error };
  },
  
  create: async (messageData) => {
    const { data, error } = await db.ticket_messages.insert(messageData).select().single();
    return { data, error };
  }
};

export const Faq = {
  findMany: async () => {
    const { data, error } = await db.from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'sort_order') => {
    try {
      const { data, error } = await db.from('faqs').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Faq.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = 'sort_order') => {
    try {
      let query = db.from('faqs').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query.order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Faq.filter error:', error);
      return [];
    }
  }
};

export const ApiKey = {
  findByUserId: async (userId) => {
    const { data, error } = await db.api_keys.select('*').eq('user_id', userId);
    return { data, error };
  },
  
  create: async (apiKeyData) => {
    const { data, error } = await db.from('api_keys').insert(apiKeyData).select().single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('api_keys').select('*').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('ApiKey.list error:', error);
      return [];
    }
  }
};

export const WhiteLabelSite = {
  findByUserId: async (userId) => {
    const { data, error } = await db.white_label_sites.select('*').eq('user_id', userId);
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('white_label_sites').select('*').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('WhiteLabelSite.list error:', error);
      return [];
    }
  }
};

export const ServiceRating = {
  findByServiceId: async (serviceId) => {
    const { data, error } = await db.service_ratings
      .select('*, users(*)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  create: async (ratingData) => {
    const { data, error } = await db.from('service_ratings').insert(ratingData).select().single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('service_ratings').select('*, users(name), services(name)').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('ServiceRating.list error:', error);
      return [];
    }
  }
};

export const DripFeedOrder = {
  findByOrderId: async (orderId) => {
    const { data, error } = await db.from('drip_feed_orders').select('*').eq('order_id', orderId);
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('drip_feed_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('DripFeedOrder.list error:', error);
      return [];
    }
  }
};





export const User = {
  findById: async (id) => {
    const { data, error } = await db.from('users').select('*').eq('id', id).single();
    return { data, error };
  },
  
  findByEmail: async (email) => {
    const { data, error } = await db.from('users').select('*').eq('email', email).single();
    return { data, error };
  },
  
  create: async (userData) => {
    const { data, error } = await db.from('users').insert(userData).select().single();
    return { data, error };
  },
  
  update: async (id, userData) => {
    const { data, error } = await db.from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
  
  // Método de compatibilidade
  list: async (orderBy = 'created_at') => {
    try {
      const { data, error } = await db.from('users').select('*').order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('User.list error:', error);
      return [];
    }
  },
  
  // Método de compatibilidade
  filter: async (filters = {}, orderBy = 'created_at') => {
    try {
      let query = db.from('users').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query.order(orderBy, { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('User.filter error:', error);
      return [];
    }
  },
  
  // Método para obter usuário atual autenticado
  me: async () => {
    try {
      const { data: { user }, error: authError } = await auth.getUser();
      if (authError || !user) {
        return { data: null, error: authError || new Error('User not authenticated') };
      }
      
      const { data, error } = await db.from('users').select('*').eq('id', user.id).single();
      return { data, error };
    } catch (error) {
      console.error('User.me error:', error);
      return { data: null, error };
    }
  },
  
  // Autenticação usando Supabase Auth
  auth
};