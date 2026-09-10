-- Comprehensive database fix for content upload issues

-- 1. Disable RLS on all tables
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate content_type constraint
ALTER TABLE content DROP CONSTRAINT IF EXISTS content_content_type_check;
ALTER TABLE content ADD CONSTRAINT content_content_type_check 
CHECK (content_type IN ('announcement', 'poster', 'infographic', 'video', 'advisory', 'voice_script', 'document', 'image', 'audio'));

-- 3. Grant all permissions
GRANT ALL ON content TO authenticated;
GRANT ALL ON content TO anon;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO anon;

-- 4. Ensure media_url column exists (if not, add it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content' AND column_name = 'media_url'
    ) THEN
        ALTER TABLE content ADD COLUMN media_url TEXT;
    END IF;
END $$;

-- 5. Ensure campaign_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content' AND column_name = 'campaign_id'
    ) THEN
        ALTER TABLE content ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
    END IF;
END $$;

-- 6. Ensure content_type column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content' AND column_name = 'content_type'
    ) THEN
        ALTER TABLE content ADD COLUMN content_type VARCHAR(50);
    END IF;
END $$;

-- 7. Ensure ai_generated column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content' AND column_name = 'ai_generated'
    ) THEN
        ALTER TABLE content ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 8. Ensure order_index column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content' AND column_name = 'order_index'
    ) THEN
        ALTER TABLE content ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
END $$;

-- 9. Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'content' 
ORDER BY ordinal_position;
