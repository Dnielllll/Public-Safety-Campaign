-- Fix content_type check constraint to allow all needed content types

-- Drop the existing check constraint
ALTER TABLE content DROP CONSTRAINT IF EXISTS content_content_type_check;

-- Create a new check constraint with all allowed content types
ALTER TABLE content ADD CONSTRAINT content_content_type_check 
CHECK (content_type IN ('announcement', 'poster', 'infographic', 'video', 'advisory', 'voice_script', 'document', 'image'));
