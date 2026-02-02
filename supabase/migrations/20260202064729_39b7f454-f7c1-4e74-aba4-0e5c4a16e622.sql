-- Add reminder_sent_at column to pending_purchases table
ALTER TABLE public.pending_purchases 
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone DEFAULT NULL;