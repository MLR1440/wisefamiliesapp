-- Create user_documents table for storing generated documents
CREATE TABLE public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('family_agreement', '30_day_plan')),
  document_data JSONB NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- Users can only view their own documents
CREATE POLICY "Users can view own documents"
  ON public.user_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own documents
CREATE POLICY "Users can create own documents"
  ON public.user_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON public.user_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON public.user_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON public.user_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();