-- InstaFly Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 10000,
    delivery_time VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id),
    instagram_username VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- White label sites table
CREATE TABLE IF NOT EXISTS whitelabel_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_domain VARCHAR(255) UNIQUE NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    accent_color VARCHAR(7) DEFAULT '#F59E0B',
    custom_css TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment logs table
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    payment_id VARCHAR(255),
    status VARCHAR(50),
    amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    type VARCHAR(50) NOT NULL,
    recipient VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_whitelabel_sites_domain ON whitelabel_sites(site_domain);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whitelabel_sites_updated_at BEFORE UPDATE ON whitelabel_sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, description, type) VALUES
('site_name', 'InstaFly', 'Nome do site', 'string'),
('site_description', 'Plataforma de crescimento para Instagram', 'Descrição do site', 'string'),
('sync_interval_minutes', '10', 'Intervalo de sincronização em minutos', 'number'),
('vapid_public_key', '', 'Chave pública VAPID para push notifications', 'string'),
('vapid_private_key', '', 'Chave privada VAPID para push notifications', 'string'),
('mercadopago_access_token', '', 'Token de acesso do Mercado Pago', 'string'),
('evolution_api_url', '', 'URL da Evolution API', 'string'),
('evolution_api_key', '', 'Chave da Evolution API', 'string')
ON CONFLICT (key) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, price, category, min_quantity, max_quantity, delivery_time) VALUES
('Seguidores Instagram', 'Seguidores reais e ativos para seu perfil', 0.05, 'followers', 100, 10000, '24-48 horas'),
('Curtidas Instagram', 'Curtidas em suas publicações', 0.02, 'likes', 50, 5000, '1-6 horas'),
('Visualizações Stories', 'Visualizações em seus stories', 0.01, 'views', 100, 10000, '1-3 horas'),
('Comentários Instagram', 'Comentários personalizados em suas publicações', 0.10, 'comments', 10, 500, '6-12 horas')
ON CONFLICT DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, usage_limit, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 100, NOW() + INTERVAL '30 days'),
('FIRST20', 'percentage', 20.00, 50, NOW() + INTERVAL '15 days'),
('SAVE5', 'fixed', 5.00, 200, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelabel_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Public services are viewable by everyone" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders are insertable by everyone" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are updatable by everyone" ON orders FOR UPDATE USING (true);
CREATE POLICY "Coupons are viewable by everyone" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Push subscriptions are manageable by everyone" ON push_subscriptions FOR ALL USING (true);
CREATE POLICY "Whitelabel sites are viewable by everyone" ON whitelabel_sites FOR SELECT USING (is_active = true);
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Payment logs are insertable by everyone" ON payment_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications are manageable by everyone" ON notifications FOR ALL USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

COMMIT;