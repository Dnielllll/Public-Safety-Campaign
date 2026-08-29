-- Fix RLS policy for content table
-- This allows authenticated users to insert, update, and delete content

-- Enable RLS on content table (if not already enabled)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "content_insert_policy" ON content;
DROP POLICY IF EXISTS "content_update_policy" ON content;
DROP POLICY IF EXISTS "content_delete_policy" ON content;
DROP POLICY IF EXISTS "content_select_policy" ON content;

-- Create policy to allow authenticated users to insert content
CREATE POLICY "content_insert_policy" ON content
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update content
CREATE POLICY "content_update_policy" ON content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete content
CREATE POLICY "content_delete_policy" ON content
FOR DELETE
TO authenticated
USING (true);

-- Create policy to allow authenticated users to select content
CREATE POLICY "content_select_policy" ON content
FOR SELECT
TO authenticated
USING (true);

-- Allow public access for select (for public view of campaigns)
CREATE POLICY "content_public_select_policy" ON content
FOR SELECT
TO anon
USING (true);
