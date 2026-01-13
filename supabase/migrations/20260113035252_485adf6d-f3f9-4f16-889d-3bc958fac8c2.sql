-- Add memory_enabled column to user_profiles (defaults to true)
ALTER TABLE public.user_profiles 
ADD COLUMN memory_enabled BOOLEAN NOT NULL DEFAULT true;