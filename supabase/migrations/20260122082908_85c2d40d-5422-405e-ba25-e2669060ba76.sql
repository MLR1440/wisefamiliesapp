-- Ensure RLS is enabled on pending_purchases (confirming it's active)
ALTER TABLE public.pending_purchases ENABLE ROW LEVEL SECURITY;

-- Document the access pattern for future developers
COMMENT ON TABLE public.pending_purchases IS 'Stores pending purchase tokens for payment-first flow. Access restricted to service role only - edge functions (verify-stripe-session, claim-purchase) manage this table. No client-side access permitted.';