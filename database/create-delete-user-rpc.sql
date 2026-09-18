-- ============================================================
-- CREATE DELETE USER BY ADMIN RPC FUNCTION
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================
-- This function properly deletes users from both auth.users and public.users
-- including related records to prevent orphaned data
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  result JSON;
BEGIN

  -- Security check: only active admins or superadmins can call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'super_admin') AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Only active admins can delete users';
  END IF;

  -- Prevent deleting yourself
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete from child tables first to avoid foreign key constraints
  -- Delete audit trail records
  DELETE FROM public.audit_trail WHERE user_id = p_user_id;
  
  -- Delete campaign-related records
  DELETE FROM public.campaigns WHERE created_by = p_user_id;
  
  -- Delete feedback records
  DELETE FROM public.feedback WHERE user_id = p_user_id;
  
  -- Delete notification records
  DELETE FROM public.notifications WHERE recipient_id = p_user_id;
  
  -- Delete from public.users
  DELETE FROM public.users WHERE id = p_user_id;
  
  -- Delete from auth.users (this will cascade to auth-related tables)
  DELETE FROM auth.users WHERE id = p_user_id;

  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'User deleted successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to delete user'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated;

-- Verify the function was created successfully
SELECT 'delete_user_by_admin function created successfully!' AS status;