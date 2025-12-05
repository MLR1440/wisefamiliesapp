-- Create events table for analytics
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create indexes for querying
CREATE INDEX events_user_id_idx ON public.events(user_id);
CREATE INDEX events_type_idx ON public.events(event_type);
CREATE INDEX events_created_idx ON public.events(created_at);

-- Policy: Allow all operations temporarily (until auth is implemented)
CREATE POLICY "Temp: Allow all event operations"
ON public.events
FOR ALL
USING (true)
WITH CHECK (true);