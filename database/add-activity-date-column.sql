-- Add activity_date column to content table
-- This will store the date when the campaign activity was conducted

ALTER TABLE content ADD COLUMN IF NOT EXISTS activity_date DATE;
