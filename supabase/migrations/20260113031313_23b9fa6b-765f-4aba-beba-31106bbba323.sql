-- Create user_memories table to store extracted conversation facts
CREATE TABLE public.user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  source_module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_user_memories_user_id ON public.user_memories(user_id);

-- Unique constraint to prevent duplicate keys per user
CREATE UNIQUE INDEX idx_user_memories_user_key ON public.user_memories(user_id, memory_key);

-- Enable RLS
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- Users can only see their own memories
CREATE POLICY "Users can view own memories" ON public.user_memories
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own memories
CREATE POLICY "Users can insert own memories" ON public.user_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own memories
CREATE POLICY "Users can update own memories" ON public.user_memories
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own memories
CREATE POLICY "Users can delete own memories" ON public.user_memories
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_memories_updated_at
  BEFORE UPDATE ON public.user_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();