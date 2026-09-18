-- Populate notifications from existing campaigns
-- This will create notifications for all published campaigns
-- Mark them as read so they don't appear as new notifications

-- First, let's check existing campaigns
SELECT id, title, status, created_at 
FROM public.campaigns 
WHERE status = 'published' 
ORDER BY created_at DESC;

-- Create notifications for all published campaigns
INSERT INTO public.notifications (recipient_id, campaign_id, title, message, type, status, read_at, created_at)
SELECT 
    u.id as recipient_id,
    c.id as campaign_id,
    'Campaign: ' || c.title as title,
    'A safety campaign "' || c.title || '" is available for viewing.' as message,
    'campaign' as type,
    'read' as status,
    NOW() as read_at,
    c.created_at as created_at
FROM public.campaigns c
CROSS JOIN public.users u
WHERE c.status = 'published'
AND u.role IN ('staff', 'citizen', 'public')
AND NOT EXISTS (
    -- Avoid creating duplicate notifications
    SELECT 1 FROM public.notifications n 
    WHERE n.campaign_id = c.id 
    AND n.recipient_id = u.id
);

-- Check how many notifications were created
SELECT COUNT(*) as notifications_created 
FROM public.notifications 
WHERE type = 'campaign';

-- Show sample of created notifications
SELECT n.id, n.title, n.status, u.name as recipient, c.title as campaign_title
FROM public.notifications n
JOIN public.users u ON n.recipient_id = u.id
LEFT JOIN public.campaigns c ON n.campaign_id = c.id
WHERE n.type = 'campaign'
ORDER BY n.created_at DESC
LIMIT 10;