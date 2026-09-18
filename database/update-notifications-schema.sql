-- Update notifications table to include type field and ensure proper structure
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'reminder';

-- Add index for type field for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Add index for campaign_id for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON public.notifications(campaign_id);

-- Add read_at column if it doesn't exist
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Update existing notifications to have proper type if they don't have one
UPDATE public.notifications 
SET type = 'campaign' 
WHERE campaign_id IS NOT NULL AND (type IS NULL OR type = '');

UPDATE public.notifications 
SET type = 'reminder' 
WHERE type IS NULL OR type = '';

-- Add check constraint for type
ALTER TABLE public.notifications 
ADD CONSTRAINT check_notification_type 
CHECK (type IN ('campaign', 'emergency', 'reminder', 'system'));