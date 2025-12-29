-- Create a table to track user purchases (server-side record of Stripe payments)
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only view their own purchases
CREATE POLICY "Users can view own purchases" ON public.user_purchases
FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert purchases" ON public.user_purchases
FOR INSERT WITH CHECK (true);

-- Create a SECURITY DEFINER function to check if user has course access
CREATE OR REPLACE FUNCTION public.user_has_course_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Check if user is admin
    public.has_role(_user_id, 'admin')
    OR
    -- Check if user has a purchase record
    EXISTS (
      SELECT 1 
      FROM public.user_purchases 
      WHERE user_id = _user_id
    )
$$;

-- Update modules policy: drop the old permissive policy and create restrictive one
DROP POLICY IF EXISTS "Anyone can view published modules" ON public.modules;
CREATE POLICY "Paid users can view published modules" ON public.modules
FOR SELECT USING (
  status = 'published' AND public.user_has_course_access(auth.uid())
);

-- Update chapters policy: drop the old permissive policy and create restrictive one  
DROP POLICY IF EXISTS "Anyone can view published chapters" ON public.chapters;
CREATE POLICY "Paid users can view published chapters" ON public.chapters
FOR SELECT USING (
  status = 'published' AND public.user_has_course_access(auth.uid())
);

-- Update module_prompts policy: drop the old permissive policy and create restrictive one
DROP POLICY IF EXISTS "Anyone can view prompts of published modules" ON public.module_prompts;
CREATE POLICY "Paid users can view prompts of published modules" ON public.module_prompts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules 
    WHERE modules.id = module_prompts.module_id 
    AND modules.status = 'published'
  )
  AND public.user_has_course_access(auth.uid())
);