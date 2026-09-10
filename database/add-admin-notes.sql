-- 1. Drop the old status check constraint
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- 2. Add the new status check constraint with 'needs_revision' and 'rejected'
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'submitted', 'pending_approval', 'needs_revision', 'rejected', 'approved', 'published', 'archived'));

-- 3. Add the admin_notes column
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS admin_notes TEXT;
