-- Add claim_token and expires_at columns to pending_purchases for database-based validation
ALTER TABLE pending_purchases 
ADD COLUMN IF NOT EXISTS claim_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour');

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_pending_purchases_claim_token ON pending_purchases(claim_token);