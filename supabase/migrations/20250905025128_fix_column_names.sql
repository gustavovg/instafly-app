-- Fix column names: created_date -> created_at
-- This migration renames created_date columns to created_at for consistency

-- Check if columns exist before renaming to avoid errors
DO $$
BEGIN
    -- Fix orders table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_date') THEN
        ALTER TABLE orders RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix services table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'created_date') THEN
        ALTER TABLE services RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix users table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_date') THEN
        ALTER TABLE users RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix customer_wallets table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_wallets' AND column_name = 'created_date') THEN
        ALTER TABLE customer_wallets RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix wallet_transactions table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'created_date') THEN
        ALTER TABLE wallet_transactions RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix affiliates table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'created_date') THEN
        ALTER TABLE affiliates RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix affiliate_earnings table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_earnings' AND column_name = 'created_date') THEN
        ALTER TABLE affiliate_earnings RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix customer_subscriptions table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_subscriptions' AND column_name = 'created_date') THEN
        ALTER TABLE customer_subscriptions RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix subscription_plans table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'created_date') THEN
        ALTER TABLE subscription_plans RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix faqs table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faqs' AND column_name = 'created_date') THEN
        ALTER TABLE faqs RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix drip_feed_orders table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drip_feed_orders' AND column_name = 'created_date') THEN
        ALTER TABLE drip_feed_orders RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix tickets table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'created_date') THEN
        ALTER TABLE tickets RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix service_ratings table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_ratings' AND column_name = 'created_date') THEN
        ALTER TABLE service_ratings RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Fix whatsapp_templates table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_templates' AND column_name = 'created_date') THEN
        ALTER TABLE whatsapp_templates RENAME COLUMN created_date TO created_at;
    END IF;
    
    
    
    -- Fix api_keys table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'created_date') THEN
        ALTER TABLE api_keys RENAME COLUMN created_date TO created_at;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON SCHEMA public IS 'Column names standardized: created_date renamed to created_at for consistency';