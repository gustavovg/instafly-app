-- Fix subscription relationship between customer_subscriptions and subscription_plans
-- This migration ensures the proper relationship exists

BEGIN;

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
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

-- Add plan_id column to customer_subscriptions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_subscriptions' 
        AND column_name = 'plan_id'
    ) THEN
        ALTER TABLE customer_subscriptions 
        ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id);
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_subscriptions_plan_id'
        AND table_name = 'customer_subscriptions'
    ) THEN
        ALTER TABLE customer_subscriptions 
        ADD CONSTRAINT fk_customer_subscriptions_plan_id 
        FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_plan_id ON customer_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_user_id ON customer_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON subscription_plans;
CREATE POLICY "Allow all operations for authenticated users" ON subscription_plans
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON customer_subscriptions;
CREATE POLICY "Allow all operations for authenticated users" ON customer_subscriptions
    FOR ALL USING (true);

-- Insert sample subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
SELECT 'Básico', 'Plano básico com funcionalidades essenciais', 29.90, 'monthly', '["max_orders: 10", "support: email"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Básico');

INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
SELECT 'Premium', 'Plano premium com todas as funcionalidades', 59.90, 'monthly', '["max_orders: 100", "support: priority", "analytics: true"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Premium');

INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
SELECT 'Anual Básico', 'Plano básico anual com desconto', 299.00, 'yearly', '["max_orders: 10", "support: email", "discount: 15%"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Anual Básico');

INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
SELECT 'Anual Premium', 'Plano premium anual com desconto', 599.00, 'yearly', '["max_orders: 100", "support: priority", "analytics: true", "discount: 15%"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Anual Premium');

COMMIT;