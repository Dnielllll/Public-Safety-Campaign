-- ============================================================
-- FIX: Insert all 4 auth users into public.users with correct roles
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Admin: adminbarangay178@gmail.com
INSERT INTO public.users (id, email, name, role, is_active, created_at, updated_at)
VALUES (
  '49b1f1be-70ce-40e8-bd8d-678f501d6a4a',
  'adminbarangay178@gmail.com',
  'Admin Barangay 178',
  'admin',
  true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = COALESCE(NULLIF(public.users.name, ''), 'Admin Barangay 178'),
  is_active = true,
  updated_at = NOW();

-- 2. Resident: danieljimenezjr30@gmail.com
INSERT INTO public.users (id, email, name, role, is_active, created_at, updated_at)
VALUES (
  '40178145-45ee-41a2-a0dc-9f6f65b982f9',
  'danieljimenezjr30@gmail.com',
  'Rivera, Daniel',
  'public',
  true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'public',
  name = COALESCE(NULLIF(public.users.name, ''), 'Rivera, Daniel'),
  is_active = true,
  updated_at = NOW();

-- 3. adam@gmail.com (Adam Lorenzo)
INSERT INTO public.users (id, email, name, role, is_active, created_at, updated_at)
VALUES (
  '24ac64a0-cffa-4580-afec-8b6389425eaf',
  'adam@gmail.com',
  'Adam Lorenzo',
  'public',
  true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = COALESCE(NULLIF(public.users.name, ''), 'Adam Lorenzo'),
  is_active = true,
  updated_at = NOW();

-- 4. miyataa030@gmail.com (Danny Dioso)
INSERT INTO public.users (id, email, name, role, is_active, created_at, updated_at)
VALUES (
  '3fa6dbe7-de0d-4f85-8856-f55db82b85dd',
  'miyataa030@gmail.com',
  'Danny Dioso',
  'public',
  true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = COALESCE(NULLIF(public.users.name, ''), 'Danny Dioso'),
  is_active = true,
  updated_at = NOW();

-- Also update auth.users metadata so the role is stored there for future fallback
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE id = '49b1f1be-70ce-40e8-bd8d-678f501d6a4a';

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "public"}'::jsonb
WHERE id = '40178145-45ee-41a2-a0dc-9f6f65b982f9';

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "public"}'::jsonb
WHERE id = '24ac64a0-cffa-4580-afec-8b6389425eaf';

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "public"}'::jsonb
WHERE id = '3fa6dbe7-de0d-4f85-8856-f55db82b85dd';

SELECT 'All 4 users synced to public.users successfully!' AS status;
