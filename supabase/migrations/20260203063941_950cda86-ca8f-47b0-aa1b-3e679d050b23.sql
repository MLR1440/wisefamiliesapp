-- Create quiz_leads table for lead capture quiz
CREATE TABLE public.quiz_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'hero',
  kit_subscriber_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous users can submit quiz (INSERT only)
CREATE POLICY "Anyone can submit quiz" 
ON public.quiz_leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view quiz leads
CREATE POLICY "Admins can view quiz leads" 
ON public.quiz_leads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage quiz leads
CREATE POLICY "Admins can manage quiz leads" 
ON public.quiz_leads 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));