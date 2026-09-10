-- Add response and status columns to feedback table if they do not exist
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS response TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
