// Correções para compatibilidade das entidades
import { supabase, db, auth } from './supabaseClient';

// Adicionar métodos de compatibilidade às entidades existentes
export const addCompatibilityMethods = () => {
  // Settings
  if (!window.Settings) window.Settings = {};
  window.Settings.list = async () => {
    try {
      const { data, error } = await db.from('settings').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Settings.list error:', error);
      return [];
    }
  };

  // Service
  if (!window.Service) window.Service = {};
  window.Service.list = async (orderBy = 'name') => {
    try {
      const { data, error } = await db.from('services').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Service.list error:', error);
      return [];
    }
  };
  
  window.Service.filter = async (filters = {}, orderBy = 'name') => {
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
  };

  // Order
  if (!window.Order) window.Order = {};
  window.Order.list = async (orderBy = '-created_at', limit = null) => {
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
  };
  
  window.Order.filter = async (filters = {}, orderBy = '-created_at') => {
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
  };

  // Faq
  if (!window.Faq) window.Faq = {};
  window.Faq.list = async (orderBy = 'sort_order') => {
    try {
      const { data, error } = await db.from('faqs').select('*').order(orderBy);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Faq.list error:', error);
      return [];
    }
  };
  
  window.Faq.filter = async (filters = {}, orderBy = 'sort_order') => {
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
  };

  // SubscriptionPlan
  if (!window.SubscriptionPlan) window.SubscriptionPlan = {};
  window.SubscriptionPlan.filter = async (filters = {}) => {
    try {
      let query = db.from('subscription_plans').select('*');
      
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('SubscriptionPlan.filter error:', error);
      return [];
    }
  };



  console.log('Métodos de compatibilidade adicionados às entidades');
};

// Adicionar métodos para CustomerSubscription
if (typeof window !== 'undefined' && window.CustomerSubscription) {
  window.CustomerSubscription.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('customer_subscriptions').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.CustomerSubscription.filter = async (filters = {}) => {
    let query = supabase.from('customer_subscriptions').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para WhiteLabelSite
if (typeof window !== 'undefined' && window.WhiteLabelSite) {
  window.WhiteLabelSite.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('white_label_sites').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.WhiteLabelSite.filter = async (filters = {}) => {
    let query = supabase.from('white_label_sites').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para ApiKey
if (typeof window !== 'undefined' && window.ApiKey) {
  window.ApiKey.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('api_keys').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.ApiKey.filter = async (filters = {}) => {
    let query = supabase.from('api_keys').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para User
if (typeof window !== 'undefined' && window.User) {
  window.User.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('users').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.User.filter = async (filters = {}) => {
    let query = supabase.from('users').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para Affiliate
if (typeof window !== 'undefined' && window.Affiliate) {
  window.Affiliate.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('affiliates').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.Affiliate.filter = async (filters = {}) => {
    let query = supabase.from('affiliates').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para AffiliateEarning
if (typeof window !== 'undefined' && window.AffiliateEarning) {
  window.AffiliateEarning.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('affiliate_earnings').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.AffiliateEarning.filter = async (filters = {}) => {
    let query = supabase.from('affiliate_earnings').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para CustomerWallet
if (typeof window !== 'undefined' && window.CustomerWallet) {
  window.CustomerWallet.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('customer_wallets').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.CustomerWallet.filter = async (filters = {}) => {
    let query = supabase.from('customer_wallets').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para WalletTransaction
if (typeof window !== 'undefined' && window.WalletTransaction) {
  window.WalletTransaction.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('wallet_transactions').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.WalletTransaction.filter = async (filters = {}) => {
    let query = supabase.from('wallet_transactions').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para Coupon
if (typeof window !== 'undefined' && window.Coupon) {
  window.Coupon.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('coupons').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.Coupon.filter = async (filters = {}) => {
    let query = supabase.from('coupons').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para ServiceRating
if (typeof window !== 'undefined' && window.ServiceRating) {
  window.ServiceRating.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('service_ratings').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.ServiceRating.filter = async (filters = {}) => {
    let query = supabase.from('service_ratings').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para WhatsAppTemplate
if (typeof window !== 'undefined' && window.WhatsAppTemplate) {
  window.WhatsAppTemplate.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('whatsapp_templates').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.WhatsAppTemplate.filter = async (filters = {}) => {
    let query = supabase.from('whatsapp_templates').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para DripFeedOrder
if (typeof window !== 'undefined' && window.DripFeedOrder) {
  window.DripFeedOrder.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('drip_feed_orders').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.DripFeedOrder.filter = async (filters = {}) => {
    let query = supabase.from('drip_feed_orders').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}

// Adicionar métodos para Ticket
if (typeof window !== 'undefined' && window.Ticket) {
  window.Ticket.list = async (orderBy = null, limit = null) => {
    let query = supabase.from('tickets').select('*');
    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  
  window.Ticket.filter = async (filters = {}) => {
    let query = supabase.from('tickets').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
}



// Objeto Core para compatibilidade
export const Core = {
  addCompatibilityMethods
};

// Executar automaticamente quando o módulo for importado
if (typeof window !== 'undefined') {
  addCompatibilityMethods();
}