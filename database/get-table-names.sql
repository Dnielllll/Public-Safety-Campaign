-- Create RPC function to get all table names from the database
-- This function will be used by the System Control page to display actual tables

CREATE OR REPLACE FUNCTION get_table_names()
RETURNS TABLE(table_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  ORDER BY table_name;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_names() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_names() TO anon;