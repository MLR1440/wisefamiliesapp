-- Drop the insecure INSERT policy
DROP POLICY IF EXISTS "Service role can insert purchases" ON public.user_purchases;

-- Create the correct policy that restricts INSERT to service_role only
CREATE POLICY "Service role can insert purchases" ON public.user_purchases
FOR INSERT TO service_role WITH CHECK (true);