-- Verify phone number was added
SELECT id, email, name, phone, role 
FROM public.users 
WHERE email = 'danieljimenezjr30@gmail.com';

-- Check all users with phone numbers
SELECT id, email, name, phone, role 
FROM public.users 
WHERE phone IS NOT NULL AND phone != '';
