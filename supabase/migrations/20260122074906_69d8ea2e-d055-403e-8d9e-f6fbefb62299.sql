-- Add price_id column to pending_purchases to distinguish payment types
ALTER TABLE public.pending_purchases ADD COLUMN price_id text;