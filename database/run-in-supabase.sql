-- ============================================================
-- SUPABASE MIGRATION: BPM + Auth Integration
-- Public Safety Campaign Management System -- Barangay 178
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Step 2: Update public.users table
-- Remove password column, add phone/address if missing
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE public.users DROP COLUMN password;
    RAISE NOTICE 'Dropped password column from public.users';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'address'
  ) THEN
    ALTER TABLE public.users ADD COLUMN address TEXT;
  END IF;
END $$;

-- ============================================================
-- Step 3: Updated handle_new_user trigger
-- Captures name, phone, address, role from signup metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, phone, address, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'public'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(EXCLUDED.name, public.users.name),
    phone      = COALESCE(EXCLUDED.phone, public.users.phone),
    address    = COALESCE(EXCLUDED.address, public.users.address),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Step 4: Seed admin user profile
-- adminbarangay178@gmail.com / UID: 49b1f1be-70ce-40e8-bd8d-678f501d6a4a
-- ============================================================
INSERT INTO public.users (id, email, name, role, is_active)
VALUES (
  '49b1f1be-70ce-40e8-bd8d-678f501d6a4a',
  'adminbarangay178@gmail.com',
  'Barangay 178 Admin',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role       = 'admin',
  name       = COALESCE(public.users.name, 'Barangay 178 Admin'),
  is_active  = true,
  updated_at = now();

-- ============================================================
-- Step 5: RLS Policies for public.users
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================
-- Step 6: BPM Engagement Tracking Module
-- ============================================================
CREATE TABLE IF NOT EXISTS public.engagement_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL CHECK (action IN (
    'viewed','shared','feedback_submitted','survey_completed',
    'notification_opened','volunteer_registered'
  )),
  channel     TEXT CHECK (channel IN ('web','sms','email','push','in_person')),
  metadata    JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_engagement_logs_campaign ON public.engagement_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_user     ON public.engagement_logs(user_id);

ALTER TABLE public.engagement_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can log engagement" ON public.engagement_logs;
CREATE POLICY "Users can log engagement" ON public.engagement_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff and admins can view engagement" ON public.engagement_logs;
CREATE POLICY "Staff and admins can view engagement" ON public.engagement_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','staff'))
  );

-- ============================================================
-- Step 7: BPM Campaign Impact Evaluation Module
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaign_evaluations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id           UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  evaluator_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_reach           INTEGER DEFAULT 0,
  engagement_count      INTEGER DEFAULT 0,
  feedback_count        INTEGER DEFAULT 0,
  average_rating        DECIMAL(3,2),
  effectiveness_score   DECIMAL(5,2),
  accomplishment_report TEXT,
  recommendations       TEXT,
  status                TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','finalized')),
  submitted_at          TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evaluations_campaign ON public.campaign_evaluations(campaign_id);
ALTER TABLE public.campaign_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admins can manage evaluations" ON public.campaign_evaluations;
CREATE POLICY "Staff and admins can manage evaluations" ON public.campaign_evaluations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','staff'))
  );

-- ============================================================
-- Step 8: BPM Volunteer/Community Engagement
-- ============================================================
CREATE TABLE IF NOT EXISTS public.volunteers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id    UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  volunteer_type TEXT CHECK (volunteer_type IN ('community_volunteer','barangay_tanod','staff')),
  status         TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  registered_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes          TEXT
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;
CREATE POLICY "Public can register as volunteer" ON public.volunteers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and admins can view volunteers" ON public.volunteers;
CREATE POLICY "Users and admins can view volunteers" ON public.volunteers
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','staff'))
  );

-- ============================================================
-- Step 9: updated_at triggers for new tables
-- ============================================================
DROP TRIGGER IF EXISTS update_evaluations_updated_at ON public.campaign_evaluations;
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.campaign_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Step 10: Enable Realtime
-- ============================================================
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users;           EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;   EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;       EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_logs; EXCEPTION WHEN duplicate_object THEN null; END $$;

SELECT 'BPM Migration complete!' AS status;
