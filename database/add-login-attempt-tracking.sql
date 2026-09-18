-- Add columns to track failed login attempts and account lockout status
-- This file should be run in Supabase SQL Editor

-- Add columns to users table for login attempt tracking
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN public.users.locked_until IS 'Timestamp until which the account is locked (NULL if not locked)';

-- Create a function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_login_attempts(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET failed_login_attempts = 0,
        locked_until = NULL
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_attempts(user_id UUID, max_attempts INTEGER DEFAULT 5, lockout_minutes INTEGER DEFAULT 15)
RETURNS boolean AS $$
DECLARE
    current_attempts INTEGER;
    is_locked BOOLEAN;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(
        SELECT 1 FROM public.users WHERE id = user_id
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RETURN false;
    END IF;
    
    -- Check if account is currently locked
    SELECT 
        COALESCE(failed_login_attempts, 0),
        locked_until > NOW()
    INTO 
        current_attempts,
        is_locked
    FROM public.users 
    WHERE id = user_id;
    
    -- If already locked, return true (is locked)
    IF is_locked THEN
        RETURN true;
    END IF;
    
    -- Increment failed attempts
    UPDATE public.users 
    SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1
    WHERE id = user_id;
    
    -- Check if we've reached max attempts
    current_attempts := current_attempts + 1;
    
    IF current_attempts >= max_attempts THEN
        -- Lock the account
        UPDATE public.users 
        SET locked_until = NOW() + (lockout_minutes || ' minutes')::INTERVAL
        WHERE id = user_id;
        RETURN true; -- Account is now locked
    END IF;
    
    RETURN false; -- Account not locked yet
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(user_id UUID)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id 
        AND locked_until > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION reset_login_attempts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_failed_attempts(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_account_locked(UUID) TO authenticated;

-- Delete problematic users to allow recreation
-- Danny Dioso
DELETE FROM public.users WHERE id = 'b514bd1c-c3a0-4992-a632-0157e34dca01';
DELETE FROM auth.users WHERE id = 'b514bd1c-c3a0-4992-a632-0157e34dca01';

-- Daniel Rivera  
DELETE FROM public.users WHERE id = '68954352-9496-4a72-bc89-0b60a50b5aa4';
DELETE FROM auth.users WHERE id = '68954352-9496-4a72-bc89-0b60a50b5aa4';
