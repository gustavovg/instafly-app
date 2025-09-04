-- InstaFly Database Schema for Supabase
-- Execute this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  is_affiliate BOOLEAN DEFAULT FALSE,
  affiliate_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  platform TEXT NOT NULL, -- instagram, tiktok, youtube, etc
  service_type TEXT NOT NULL, -- followers, likes, views, etc
  price_per_1000 DECIMAL(10,4) NOT NULL,
  min_quantity INTEGER DEFAULT 100,
  max_quantity INTEGER DEFAULT 100000,
  is_active BOOLEAN DEFAULT TRUE,
  provider_service_id TEXT,
  estimated_delivery TEXT,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  target_url TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled, refunded
  provider_order_id TEXT,
  start_count INTEGER DEFAULT 0,
  remains INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_id TEXT,
  coupon_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE public.coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- percentage, fixed
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- percentage
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate Earnings table
CREATE TABLE public.affiliate_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Wallets table
CREATE TABLE public.customer_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions table
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_id UUID REFERENCES public.customer_wallets(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL, -- deposit, withdrawal, order_payment, refund
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID, -- order_id, payment_id, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Plans table
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL, -- monthly, yearly
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Subscriptions table
CREATE TABLE public.customer_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, in_progress, closed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Messages table
CREATE TABLE public.ticket_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) NOT NULL,
  user_id UUID REFERENCES public.users(id),
  message TEXT NOT NULL,
  is_staff_reply BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs table
CREATE TABLE public.faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table
CREATE TABLE public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- White Label Sites table
CREATE TABLE public.white_label_sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  site_name TEXT NOT NULL,
  logo_url TEXT,
  theme_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Ratings table
CREATE TABLE public.service_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drip Feed Orders table
CREATE TABLE public.drip_feed_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  total_quantity INTEGER NOT NULL,
  runs INTEGER NOT NULL,
  interval_minutes INTEGER NOT NULL,
  completed_runs INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, paused, completed, cancelled
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Flows table
CREATE TABLE public.chatbot_flows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_keywords JSONB DEFAULT '[]',
  flow_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Settings table
CREATE TABLE public.chatbot_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Templates table
CREATE TABLE public.whatsapp_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_platform ON public.services(platform);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_affiliate_earnings_affiliate_id ON public.affiliate_earnings(affiliate_id);
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallet policies
CREATE POLICY "Users can view own wallet" ON public.customer_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Ticket policies
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ticket messages" ON public.ticket_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for services, settings, faqs
CREATE POLICY "Public can view services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view faqs" ON public.faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Functions

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create wallet for new user
  INSERT INTO public.customer_wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user balance
CREATE OR REPLACE FUNCTION public.update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET balance = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.wallet_transactions 
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update balance on wallet transactions
CREATE TRIGGER on_wallet_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_balance();

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('site_name', '"InstaFly"', 'Nome do site'),
('site_description', '"Plataforma de crescimento para redes sociais"', 'Descrição do site'),
('currency', '"BRL"', 'Moeda padrão'),
('min_deposit', '10.00', 'Valor mínimo de depósito'),
('max_deposit', '10000.00', 'Valor máximo de depósito'),
('affiliate_commission', '10.00', 'Comissão de afiliado (%)'),
('maintenance_mode', 'false', 'Modo de manutenção'),
('registration_enabled', 'true', 'Registro habilitado'),
('google_auth_enabled', 'true', 'Autenticação Google habilitada');

-- Insert sample services
INSERT INTO public.services (name, description, category, platform, service_type, price_per_1000, min_quantity, max_quantity) VALUES
('Seguidores Instagram Brasileiros', 'Seguidores brasileiros reais e ativos', 'Seguidores', 'instagram', 'followers', 15.00, 100, 50000),
('Curtidas Instagram', 'Curtidas rápidas e seguras', 'Curtidas', 'instagram', 'likes', 8.00, 50, 10000),
('Visualizações Instagram Stories', 'Visualizações para seus stories', 'Visualizações', 'instagram', 'story_views', 5.00, 100, 20000),
('Seguidores TikTok', 'Seguidores de qualidade para TikTok', 'Seguidores', 'tiktok', 'followers', 12.00, 100, 30000),
('Curtidas TikTok', 'Curtidas para seus vídeos no TikTok', 'Curtidas', 'tiktok', 'likes', 6.00, 50, 15000),
('Visualizações YouTube', 'Visualizações reais para YouTube', 'Visualizações', 'youtube', 'views', 10.00, 1000, 100000);

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category) VALUES
('Como funciona o InstaFly?', 'O InstaFly é uma plataforma que oferece serviços de crescimento para redes sociais de forma segura e eficiente.', 'Geral'),
('Os serviços são seguros?', 'Sim, todos os nossos serviços são 100% seguros e não violam os termos de uso das plataformas.', 'Segurança'),
('Quanto tempo demora para entregar?', 'O tempo de entrega varia de acordo com o serviço, geralmente entre 1 a 24 horas.', 'Entrega'),
('Posso cancelar um pedido?', 'Pedidos podem ser cancelados apenas se ainda não foram iniciados.', 'Pedidos'),
('Como funciona o programa de afiliados?', 'Você ganha comissão de 10% em todos os pedidos feitos por seus indicados.', 'Afiliados');

COMMIT;