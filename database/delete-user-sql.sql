-- Complete Deletion SQL for Daniel Rivera
-- Run these in Supabase SQL Editor in the exact order shown
-- User ID: 2ddb77b3-a1a0-4a60-9780-9ecb7b34a834
-- Email: danieljimenezjr30@gmail.com

-- Step 1: Delete from audit_trail (must be first due to foreign key constraint)
DELETE FROM audit_trail WHERE user_id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Step 2: Delete from notifications (if this table exists and references users)
DELETE FROM notifications WHERE recipient_id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Step 3: Delete from feedback (if this table exists and references users)
DELETE FROM feedback WHERE user_id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Step 4: Delete from campaigns (if created_by references users)
DELETE FROM campaigns WHERE created_by = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Step 5: Delete from content (if campaign_id references campaigns created by this user)
-- This is handled indirectly through the campaigns deletion above

-- Step 6: Delete from public.users
DELETE FROM public.users WHERE id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Step 7: Delete from auth.users (requires admin privileges)
-- If this fails due to permissions, use Supabase Dashboard instead:
-- Go to Authentication > Users > Find danieljimenezjr30@gmail.com > Delete
DELETE FROM auth.users WHERE id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Verification: Check if user is completely deleted
SELECT 'User in public.users:' as check_table, COUNT(*) as count FROM public.users WHERE id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834'
UNION ALL
SELECT 'User in audit_trail:', COUNT(*) FROM audit_trail WHERE user_id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834'
UNION ALL  
SELECT 'User in notifications:', COUNT(*) FROM notifications WHERE recipient_id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834'
UNION ALL
SELECT 'User in feedback:', COUNT(*) FROM feedback WHERE user_id = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834'
UNION ALL
SELECT 'User in campaigns:', COUNT(*) FROM campaigns WHERE created_by = '2ddb77b3-a1a0-4a60-9780-9ecb7b34a834';

-- Alternative: If you prefer to delete by email instead of ID, use this:
-- DELETE FROM audit_trail WHERE user_id IN (SELECT id FROM public.users WHERE email = 'danieljimenezjr30@gmail.com');
-- DELETE FROM notifications WHERE recipient_id IN (SELECT id FROM public.users WHERE email = 'danieljimenezjr30@gmail.com');
-- DELETE FROM feedback WHERE user_id IN (SELECT id FROM public.users WHERE email = 'danieljimenezjr30@gmail.com');
-- DELETE FROM campaigns WHERE created_by IN (SELECT id FROM public.users WHERE email = 'danieljimenezjr30@gmail.com');
-- DELETE FROM public.users WHERE email = 'danieljimenezjr30@gmail.com';
-- DELETE FROM auth.users WHERE email = 'danieljimenezjr30@gmail.com';
