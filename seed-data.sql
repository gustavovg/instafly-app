-- InstaFly Seed Data Adicional
-- Execute este SQL no SQL Editor do Supabase
-- IMPORTANTE: Execute o supabase-schema.sql primeiro!

-- Insert additional settings
INSERT INTO public.settings (key, value, description) VALUES
('sync_interval_minutes', '10', 'Intervalo de sincronização em minutos'),
('vapid_public_key', '""', 'Chave pública VAPID para push notifications'),
('vapid_private_key', '""', 'Chave privada VAPID para push notifications'),
('mercadopago_access_token', '""', 'Token de acesso do Mercado Pago'),
('evolution_api_url', '""', 'URL da Evolution API'),
('evolution_api_key', '""', 'Chave da Evolution API')
ON CONFLICT (key) DO NOTHING;

-- Insert additional services for Instagram
INSERT INTO public.services (name, description, category, price, min_quantity, max_quantity, delivery_time) VALUES
('Seguidores Instagram Premium', 'Seguidores premium brasileiros de alta qualidade', 'Instagram', 25.00, 100, 20000, '12-24 horas'),
('Curtidas Instagram Premium', 'Curtidas de contas verificadas e ativas', 'Instagram', 12.00, 25, 5000, '2-8 horas'),
('Visualizações Reels Premium', 'Visualizações premium em seus Reels do Instagram', 'Instagram', 8.00, 500, 50000, '2-6 horas'),
('Comentários Instagram', 'Comentários personalizados em suas publicações', 'Instagram', 150.00, 5, 100, '6-12 horas'),
('Saves Instagram', 'Salvamentos em suas publicações', 'Instagram', 30.00, 25, 2000, '3-8 horas')
ON CONFLICT DO NOTHING;

-- Insert services for TikTok
INSERT INTO public.services (name, description, category, price, min_quantity, max_quantity, delivery_time) VALUES
('Seguidores TikTok Premium', 'Seguidores brasileiros reais e ativos no TikTok', 'TikTok', 20.00, 100, 15000, '6-12 horas'),
('Curtidas TikTok Premium', 'Curtidas de alta qualidade em seus vídeos', 'TikTok', 8.00, 50, 10000, '1-4 horas'),
('Visualizações TikTok Premium', 'Visualizações premium em seus vídeos do TikTok', 'TikTok', 3.00, 1000, 100000, '1-3 horas'),
('Compartilhamentos TikTok', 'Compartilhamentos orgânicos em seus vídeos', 'TikTok', 50.00, 10, 1000, '4-8 horas'),
('Comentários TikTok', 'Comentários personalizados em português', 'TikTok', 120.00, 5, 200, '6-12 horas')
ON CONFLICT DO NOTHING;

-- Insert services for YouTube
INSERT INTO public.services (name, description, category, price, min_quantity, max_quantity, delivery_time) VALUES
('Inscritos YouTube Premium', 'Inscritos brasileiros reais para seu canal', 'YouTube', 35.00, 50, 10000, '24-48 horas'),
('Visualizações YouTube Premium', 'Visualizações de alta retenção em seus vídeos', 'YouTube', 5.00, 1000, 500000, '2-6 horas'),
('Curtidas YouTube Premium', 'Curtidas orgânicas em seus vídeos', 'YouTube', 15.00, 25, 5000, '3-8 horas'),
('Comentários YouTube', 'Comentários personalizados em português', 'YouTube', 200.00, 3, 50, '12-24 horas'),
('Tempo de Reprodução YouTube', 'Horas de reprodução para monetização', 'YouTube', 100.00, 100, 10000, '24-72 horas')
ON CONFLICT DO NOTHING;

-- Insert services for Facebook
INSERT INTO public.services (name, description, category, price, min_quantity, max_quantity, delivery_time) VALUES
('Seguidores Facebook Premium', 'Seguidores brasileiros para sua página', 'Facebook', 22.00, 100, 20000, '12-24 horas'),
('Curtidas Facebook Premium', 'Curtidas em suas publicações do Facebook', 'Facebook', 10.00, 50, 8000, '2-6 horas'),
('Compartilhamentos Facebook', 'Compartilhamentos orgânicos de suas publicações', 'Facebook', 60.00, 10, 2000, '4-12 horas'),
('Comentários Facebook', 'Comentários personalizados em português', 'Facebook', 180.00, 5, 100, '8-16 horas')
ON CONFLICT DO NOTHING;

-- Insert sample coupons
INSERT INTO public.coupons (code, discount_type, discount_value, usage_limit, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 100, NOW() + INTERVAL '30 days'),
('FIRST20', 'percentage', 20.00, 50, NOW() + INTERVAL '15 days'),
('SAVE5', 'fixed', 5.00, 200, NOW() + INTERVAL '60 days'),
('INSTAGRAM15', 'percentage', 15.00, 75, NOW() + INTERVAL '45 days'),
('TIKTOK25', 'percentage', 25.00, 30, NOW() + INTERVAL '20 days')
ON CONFLICT (code) DO NOTHING;

-- Note: FAQs table does not exist in the current schema
-- If you need FAQs, create the table first or use the newer supabase-schema.sql

COMMIT;