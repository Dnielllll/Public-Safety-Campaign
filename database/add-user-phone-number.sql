-- Update user's phone number for SMS distribution
-- This updates the phone number for Daniel Rivera (danieljimenezjr30@gmail.com)

UPDATE public.users 
SET phone = '09910576711'
WHERE email = 'danieljimenezjr30@gmail.com';

-- Verify the update
SELECT id, email, name, phone, role 
FROM public.users 
WHERE email = 'danieljimenezjr30@gmail.com';