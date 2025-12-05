-- Create chapters table
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- RLS policies for chapters
CREATE POLICY "Admins can manage all chapters" 
ON public.chapters 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published chapters" 
ON public.chapters 
FOR SELECT 
USING (status = 'published');

-- Add trigger for updated_at
CREATE TRIGGER update_chapters_updated_at
BEFORE UPDATE ON public.chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add chapter_id to modules table
ALTER TABLE public.modules ADD COLUMN chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_modules_chapter_id ON public.modules(chapter_id);