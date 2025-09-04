import { supabase, db, auth } from './supabaseClient';

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
  }
};

export const AffiliateEarning = {
  findByAffiliateId: async (affiliateId) => {
    const { data, error } = await db.affiliate_earnings
      .select('*, orders(*)')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });
    return { data, error };
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
  }
};

export const SubscriptionPlan = {
  findMany: async () => {
    const { data, error } = await db.subscription_plans.select('*').eq('is_active', true);
    return { data, error };
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
    const { data, error } = await db.faqs
      .select('*')
      .eq('is_published', true)
      .order('sort_order');
    return { data, error };
  }
};

export const ApiKey = {
  findByUserId: async (userId) => {
    const { data, error } = await db.api_keys.select('*').eq('user_id', userId);
    return { data, error };
  }
};

export const WhiteLabelSite = {
  findByUserId: async (userId) => {
    const { data, error } = await db.white_label_sites.select('*').eq('user_id', userId);
    return { data, error };
  }
};

export const ServiceRating = {
  findByServiceId: async (serviceId) => {
    const { data, error } = await db.service_ratings
      .select('*, users(*)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

export const DripFeedOrder = {
  findByOrderId: async (orderId) => {
    const { data, error } = await db.drip_feed_orders.select('*').eq('order_id', orderId).single();
    return { data, error };
  }
};

export const ChatbotFlow = {
  findMany: async () => {
    const { data, error } = await db.chatbot_flows.select('*').eq('is_active', true);
    return { data, error };
  }
};

export const ChatbotSettings = {
  findMany: async () => {
    const { data, error } = await db.chatbot_settings.select('*');
    return { data, error };
  }
};

// Autenticação usando Supabase Auth
export const User = auth;