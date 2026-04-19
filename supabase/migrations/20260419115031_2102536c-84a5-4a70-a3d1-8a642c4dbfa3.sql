-- Add explicit restrictive policies to pending_purchases to make
-- service-role-only access explicit and prevent any future permissive
-- policy from accidentally exposing sensitive payment data.

-- Restrictive policies use AND semantics: even if a permissive policy
-- is later added, these will block all client (anon/authenticated) access.

CREATE POLICY "Deny all client SELECT on pending_purchases"
ON public.pending_purchases
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Deny all client INSERT on pending_purchases"
ON public.pending_purchases
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Deny all client UPDATE on pending_purchases"
ON public.pending_purchases
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all client DELETE on pending_purchases"
ON public.pending_purchases
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (false);