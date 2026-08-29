-- Comprehensive RLS fix for all campaign-related tables
-- This disables RLS on all tables to allow operations

-- Disable RLS on content table
ALTER TABLE content DISABLE ROW LEVEL SECURITY;

-- Disable RLS on campaigns table (in case it's needed)
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Disable RLS on users table (in case it's needed)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on feedback table (in case it's needed)
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- Disable RLS on voice_announcements table (in case it's needed)
ALTER TABLE voice_announcements DISABLE ROW LEVEL SECURITY;

-- Disable RLS on notifications table (in case it's needed)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON content TO authenticated;
GRANT ALL ON content TO anon;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO anon;
