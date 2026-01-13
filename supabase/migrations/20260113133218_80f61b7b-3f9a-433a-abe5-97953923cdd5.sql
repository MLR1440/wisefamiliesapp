-- Add transcript column for read-along content
ALTER TABLE public.modules
ADD COLUMN transcript TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.modules.transcript IS 'Read-along text content for users to follow along with the video';