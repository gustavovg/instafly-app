-- Populate database with realistic data for InstaFly platform
-- This migration adds comprehensive service data for all social media platforms

-- Clear existing data to avoid conflicts
DELETE FROM services;
DELETE FROM settings WHERE key NOT IN ('admin_username', 'admin_password');
DELETE FROM subscription_plans;
DELETE FROM faqs;
DELETE FROM whatsapp_templates;

-- Insert system settings
INSERT INTO settings (key, value, description) VALUES
('site_name', 'InstaFly', 'Nome do site'),
('site_description', 'Plataforma completa para impulsionar suas redes sociais', 'Descrição do site'),
('contact_email', 'contato@instafly.com.br', 'Email de contato'),
('whatsapp_number', '5511999999999', 'Número do WhatsApp para suporte'),
('sync_interval_minutes', '10', 'Intervalo de sincronização em minutos'),
('min_deposit_amount', '10.00', 'Valor mínimo de depósito'),
('max_deposit_amount', '5000.00', 'Valor máximo de depósito'),
('currency', 'BRL', 'Moeda padrão'),
('timezone', 'America/Sao_Paulo', 'Fuso horário'),
('maintenance_mode', 'false', 'Modo de manutenção'),
('registration_enabled', 'true', 'Registro de novos usuários habilitado'),
('affiliate_commission_rate', '10.00', 'Taxa de comissão de afiliados (%)'),
('vapid_public_key', '', 'Chave pública VAPID para push notifications'),
('vapid_private_key', '', 'Chave privada VAPID para push notifications'),
('mercadopago_access_token', '', 'Token de acesso do Mercado Pago'),
('evolution_api_url', '', 'URL da Evolution API'),
('evolution_api_key', '', 'Chave da Evolution API')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert Instagram services
INSERT INTO services (name, description, category, platform, price, min_quantity, max_quantity, delivery_time, is_active) VALUES
('Seguidores Instagram Brasileiros', 'Seguidores brasileiros reais e ativos para seu perfil', 'Seguidores', 'Instagram', 0.025, 100, 50000, '6-12 horas', true),
('Seguidores Instagram Premium', 'Seguidores premium de alta qualidade com perfis completos', 'Seguidores', 'Instagram', 0.045, 100, 25000, '12-24 horas', true),
('Curtidas Instagram', 'Curtidas rápidas em suas publicações', 'Curtidas', 'Instagram', 0.008, 50, 10000, '1-3 horas', true),
('Curtidas Instagram Premium', 'Curtidas de contas verificadas e ativas', 'Curtidas', 'Instagram', 0.015, 25, 5000, '2-6 horas', true),
('Visualizações Stories Instagram', 'Visualizações em seus Stories do Instagram', 'Visualizações', 'Instagram', 0.003, 100, 50000, '1-2 horas', true),
('Visualizações Reels Instagram', 'Visualizações premium em seus Reels', 'Visualizações', 'Instagram', 0.005, 500, 100000, '2-4 horas', true),
('Comentários Instagram', 'Comentários personalizados em português', 'Comentários', 'Instagram', 1.50, 5, 100, '6-12 horas', true),
('Saves Instagram', 'Salvamentos em suas publicações', 'Saves', 'Instagram', 0.020, 25, 5000, '3-8 horas', true),
('Impressões Instagram', 'Impressões orgânicas em suas publicações', 'Impressões', 'Instagram', 0.002, 1000, 500000, '1-4 horas', true),
('Alcance Instagram', 'Aumento do alcance de suas publicações', 'Alcance', 'Instagram', 0.004, 500, 100000, '2-6 horas', true),

-- Insert TikTok services
('Seguidores TikTok Brasileiros', 'Seguidores brasileiros reais para seu perfil TikTok', 'Seguidores', 'TikTok', 0.020, 100, 30000, '4-8 horas', true),
('Seguidores TikTok Premium', 'Seguidores premium ativos e engajados', 'Seguidores', 'TikTok', 0.035, 100, 15000, '6-12 horas', true),
('Curtidas TikTok', 'Curtidas rápidas em seus vídeos', 'Curtidas', 'TikTok', 0.005, 50, 20000, '30min-2 horas', true),
('Curtidas TikTok Premium', 'Curtidas de alta qualidade', 'Curtidas', 'TikTok', 0.010, 50, 10000, '1-4 horas', true),
('Visualizações TikTok', 'Visualizações rápidas em seus vídeos', 'Visualizações', 'TikTok', 0.001, 1000, 1000000, '30min-2 horas', true),
('Visualizações TikTok Premium', 'Visualizações de alta retenção', 'Visualizações', 'TikTok', 0.003, 1000, 500000, '1-3 horas', true),
('Compartilhamentos TikTok', 'Compartilhamentos orgânicos', 'Compartilhamentos', 'TikTok', 0.050, 10, 2000, '4-8 horas', true),
('Comentários TikTok', 'Comentários personalizados em português', 'Comentários', 'TikTok', 1.20, 5, 200, '6-12 horas', true),
('Lives TikTok', 'Espectadores para suas lives', 'Lives', 'TikTok', 0.080, 50, 5000, '2-4 horas', true),

-- Insert YouTube services
('Inscritos YouTube Brasileiros', 'Inscritos brasileiros reais para seu canal', 'Inscritos', 'YouTube', 0.040, 50, 20000, '12-24 horas', true),
('Inscritos YouTube Premium', 'Inscritos premium de alta qualidade', 'Inscritos', 'YouTube', 0.070, 50, 10000, '24-48 horas', true),
('Visualizações YouTube', 'Visualizações rápidas em seus vídeos', 'Visualizações', 'YouTube', 0.002, 1000, 1000000, '2-6 horas', true),
('Visualizações YouTube Premium', 'Visualizações de alta retenção', 'Visualizações', 'YouTube', 0.005, 1000, 500000, '4-8 horas', true),
('Curtidas YouTube', 'Curtidas em seus vídeos', 'Curtidas', 'YouTube', 0.012, 25, 10000, '2-6 horas', true),
('Curtidas YouTube Premium', 'Curtidas orgânicas de alta qualidade', 'Curtidas', 'YouTube', 0.020, 25, 5000, '3-8 horas', true),
('Comentários YouTube', 'Comentários personalizados em português', 'Comentários', 'YouTube', 2.00, 3, 100, '12-24 horas', true),
('Tempo de Reprodução YouTube', 'Horas de reprodução para monetização', 'Tempo de Reprodução', 'YouTube', 0.100, 100, 50000, '24-72 horas', true),
('Shorts YouTube', 'Visualizações em YouTube Shorts', 'Shorts', 'YouTube', 0.001, 1000, 1000000, '1-4 horas', true),

-- Insert Facebook services
('Seguidores Facebook', 'Seguidores para sua página do Facebook', 'Seguidores', 'Facebook', 0.030, 100, 25000, '8-16 horas', true),
('Seguidores Facebook Premium', 'Seguidores premium brasileiros', 'Seguidores', 'Facebook', 0.050, 100, 15000, '12-24 horas', true),
('Curtidas Facebook', 'Curtidas em suas publicações', 'Curtidas', 'Facebook', 0.010, 50, 15000, '2-6 horas', true),
('Curtidas Facebook Premium', 'Curtidas de perfis verificados', 'Curtidas', 'Facebook', 0.018, 50, 8000, '4-8 horas', true),
('Compartilhamentos Facebook', 'Compartilhamentos orgânicos', 'Compartilhamentos', 'Facebook', 0.060, 10, 5000, '4-12 horas', true),
('Comentários Facebook', 'Comentários personalizados', 'Comentários', 'Facebook', 1.80, 5, 100, '8-16 horas', true),
('Visualizações Vídeo Facebook', 'Visualizações em vídeos do Facebook', 'Visualizações', 'Facebook', 0.003, 500, 100000, '2-6 horas', true),

-- Insert Kwai services
('Seguidores Kwai', 'Seguidores brasileiros para seu perfil Kwai', 'Seguidores', 'Kwai', 0.025, 100, 20000, '6-12 horas', true),
('Curtidas Kwai', 'Curtidas em seus vídeos do Kwai', 'Curtidas', 'Kwai', 0.008, 50, 15000, '1-4 horas', true),
('Visualizações Kwai', 'Visualizações em seus vídeos', 'Visualizações', 'Kwai', 0.002, 1000, 500000, '1-3 horas', true),
('Comentários Kwai', 'Comentários personalizados em português', 'Comentários', 'Kwai', 1.30, 5, 150, '6-12 horas', true),
('Compartilhamentos Kwai', 'Compartilhamentos orgânicos', 'Compartilhamentos', 'Kwai', 0.045, 10, 3000, '4-8 horas', true);

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, is_active) VALUES
('Básico', 'Plano ideal para iniciantes', 29.90, 'monthly', '{"max_orders": 50, "discount": 5, "priority_support": false, "api_access": false}', true),
('Premium', 'Plano para usuários avançados', 59.90, 'monthly', '{"max_orders": 200, "discount": 10, "priority_support": true, "api_access": true}', true),
('Profissional', 'Plano para agências e profissionais', 99.90, 'monthly', '{"max_orders": 500, "discount": 15, "priority_support": true, "api_access": true, "white_label": true}', true),
('Empresarial', 'Plano para grandes empresas', 199.90, 'monthly', '{"max_orders": -1, "discount": 20, "priority_support": true, "api_access": true, "white_label": true, "custom_domain": true}', true);

-- Insert FAQs
INSERT INTO faqs (question, answer, category, is_active) VALUES
('Como funciona o InstaFly?', 'O InstaFly é uma plataforma que oferece serviços de marketing digital para redes sociais. Você escolhe o serviço desejado, faz o pedido e nossa equipe entrega os resultados no prazo estabelecido.', 'Geral', true),
('Os serviços são seguros?', 'Sim, todos os nossos serviços são 100% seguros e seguem as diretrizes das plataformas. Utilizamos apenas métodos orgânicos e aprovados.', 'Segurança', true),
('Quanto tempo demora para entregar?', 'O tempo de entrega varia de acordo com o serviço escolhido. Geralmente entre 30 minutos a 72 horas. Você pode ver o prazo específico na página de cada serviço.', 'Entrega', true),
('Posso cancelar meu pedido?', 'Pedidos podem ser cancelados apenas se ainda não foram iniciados. Após o início da entrega, não é possível cancelar.', 'Pedidos', true),
('Como funciona o sistema de afiliados?', 'Nosso programa de afiliados oferece 10% de comissão sobre todas as vendas realizadas através do seu link. O pagamento é feito semanalmente.', 'Afiliados', true),
('Quais formas de pagamento vocês aceitam?', 'Aceitamos PIX, cartão de crédito, débito e transferência bancária. Também oferecemos sistema de carteira digital para facilitar suas compras.', 'Pagamento', true),
('Vocês oferecem garantia?', 'Sim, oferecemos garantia de 30 dias em todos os nossos serviços. Se houver qualquer problema, repomos gratuitamente.', 'Garantia', true),
('Como entro em contato com o suporte?', 'Você pode entrar em contato através do WhatsApp, email ou sistema de tickets dentro da plataforma. Nosso suporte funciona 24/7.', 'Suporte', true),
('Posso revender os serviços?', 'Sim, oferecemos planos especiais para revendedores com preços diferenciados e API para integração com seus sistemas.', 'Revenda', true),
('Os resultados são permanentes?', 'Nossos serviços oferecem resultados duradouros, mas recomendamos manter uma estratégia consistente para melhores resultados a longo prazo.', 'Resultados', true);

-- Insert WhatsApp templates
INSERT INTO whatsapp_templates (name, template, variables, is_active) VALUES
('Boas-vindas', 'Olá {nome}! 👋\n\nSeja bem-vindo(a) ao InstaFly! 🚀\n\nEstamos aqui para impulsionar suas redes sociais com os melhores serviços do mercado.\n\nSe precisar de ajuda, é só chamar! 😊', '["nome"]', true),
('Pedido Confirmado', 'Oi {nome}! ✅\n\nSeu pedido #{pedido_id} foi confirmado com sucesso!\n\n📦 Serviço: {servico}\n💰 Valor: R$ {valor}\n⏰ Prazo: {prazo}\n\nAcompanhe o status em nossa plataforma!', '["nome", "pedido_id", "servico", "valor", "prazo"]', true),
('Pedido Concluído', 'Parabéns {nome}! 🎉\n\nSeu pedido #{pedido_id} foi concluído com sucesso!\n\n✨ Serviço: {servico}\n📈 Quantidade entregue: {quantidade}\n\nObrigado por confiar no InstaFly! 💙', '["nome", "pedido_id", "servico", "quantidade"]', true),
('Suporte', 'Olá! 👋\n\nPrecisa de ajuda? Nossa equipe de suporte está aqui para você!\n\n🕐 Horário: 24h por dia\n📱 WhatsApp: Sempre online\n💬 Chat: Disponível na plataforma\n\nComo podemos ajudar?', '[]', true);

-- Note: Using UUIDs, no need to update sequences

-- Add comment for documentation
COMMENT ON SCHEMA public IS 'Database populated with realistic service data for all social media platforms';