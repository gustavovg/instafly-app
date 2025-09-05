import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper para autenticação
export const auth = {
  // Login com email e senha
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Registro com email e senha
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  // Login com Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obter usuário atual
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Obter sessão atual
  getSession: () => {
    return supabase.auth.getSession()
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Helper para operações de banco de dados
export const db = {
  // Operações genéricas para qualquer tabela
  from: (table) => supabase.from(table),
  
  // Operações específicas por entidade
  orders: supabase.from('orders'),
  services: supabase.from('services'),
  users: supabase.from('users'),
  settings: supabase.from('settings'),
  coupons: supabase.from('coupons'),
  affiliates: supabase.from('affiliates'),
  affiliate_earnings: supabase.from('affiliate_earnings'),
  customer_wallets: supabase.from('customer_wallets'),
  wallet_transactions: supabase.from('wallet_transactions'),
  subscription_plans: supabase.from('subscription_plans'),
  customer_subscriptions: supabase.from('customer_subscriptions'),
  tickets: supabase.from('tickets'),
  ticket_messages: supabase.from('ticket_messages'),
  faqs: supabase.from('faqs'),
  api_keys: supabase.from('api_keys'),
  white_label_sites: supabase.from('white_label_sites'),
  service_ratings: supabase.from('service_ratings'),
  drip_feed_orders: supabase.from('drip_feed_orders'),

  whatsapp_templates: supabase.from('whatsapp_templates'),
  push_subscriptions: supabase.from('push_subscriptions')
}

// Helper para storage
export const storage = {
  // Upload de arquivo
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  // Download de arquivo
  download: async (bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    return { data, error }
  },

  // Obter URL pública
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Deletar arquivo
  remove: async (bucket, paths) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)
    return { data, error }
  }
}

export default supabase