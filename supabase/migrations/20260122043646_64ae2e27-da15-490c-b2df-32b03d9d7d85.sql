-- Create pending_purchases table for storing Stripe sessions before account creation
CREATE TABLE public.pending_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_email TEXT,
  product_id TEXT NOT NULL,
  amount_total INTEGER,
  currency TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Service role only (edge functions manage this)
ALTER TABLE public.pending_purchases ENABLE ROW LEVEL SECURITY;

-- Add refund tracking columns to user_purchases
ALTER TABLE public.user_purchases 
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_checked_at TIMESTAMP WITH TIME ZONE;