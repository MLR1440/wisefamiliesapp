-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_number INTEGER NOT NULL DEFAULT 1,
  video_url TEXT NOT NULL DEFAULT '',
  video_type TEXT NOT NULL DEFAULT 'none' CHECK (video_type IN ('youtube', 'vimeo', 'direct', 'none')),
  system_prompt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  next_module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Public read access for published modules (students can view)
CREATE POLICY "Anyone can view published modules" 
ON public.modules 
FOR SELECT 
USING (status = 'published');

-- Create module_prompts table
CREATE TABLE public.module_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  order_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.module_prompts ENABLE ROW LEVEL SECURITY;

-- Public read access for prompts of published modules
CREATE POLICY "Anyone can view prompts of published modules" 
ON public.module_prompts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.modules 
  WHERE modules.id = module_prompts.module_id 
  AND modules.status = 'published'
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();