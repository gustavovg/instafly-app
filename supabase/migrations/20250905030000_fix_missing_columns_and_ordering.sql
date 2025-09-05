-- Fix missing columns and ordering issues



-- Add missing order_index column to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Update existing records to have proper order_index values
-- Use row_number() to assign sequential order_index values

WITH numbered_services AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM services
    WHERE order_index = 0
)
UPDATE services 
SET order_index = numbered_services.rn
FROM numbered_services 
WHERE services.id = numbered_services.id;

-- Fix ordering syntax issues by ensuring created_at columns exist and are properly named
-- Some entities are still trying to use created_date instead of created_at

-- Ensure all tables have created_at instead of created_date
DO $$
BEGIN
    -- Check and rename created_date to created_at in users table if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_date') THEN
        ALTER TABLE users RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Check and rename created_date to created_at in coupons table if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'created_date') THEN
        ALTER TABLE coupons RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Check and rename created_date to created_at in affiliates table if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'created_date') THEN
        ALTER TABLE affiliates RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Check and rename created_date to created_at in affiliate_earnings table if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_earnings' AND column_name = 'created_date') THEN
        ALTER TABLE affiliate_earnings RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Check and rename created_date to created_at in wallet_transactions table if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'created_date') THEN
        ALTER TABLE wallet_transactions RENAME COLUMN created_date TO created_at;
    END IF;
    
    -- Check and rename created_date to created_at in customer_wallets table if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_wallets' AND column_name = 'created_date') THEN
        ALTER TABLE customer_wallets RENAME COLUMN created_date TO created_at;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_order_index ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_user_id ON customer_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);

-- Update RLS policies if needed
ALTER TABLE services ENABLE ROW LEVEL SECURITY;



-- Create or replace policies for services
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON services;
CREATE POLICY "Allow all operations for authenticated users" ON services
    FOR ALL USING (true);

COMMIT;