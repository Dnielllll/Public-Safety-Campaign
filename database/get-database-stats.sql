-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Creates RPC functions to get Database Statistics for the Super Admin
-- ============================================================

-- Function to get overall database size and status
CREATE OR REPLACE FUNCTION public.get_database_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_size TEXT;
  tbl_count INT;
  res JSONB;
BEGIN
  -- Get total database size
  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
  
  -- Get total user tables
  SELECT count(*) INTO tbl_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  res := jsonb_build_object(
    'size', db_size,
    'total_tables', tbl_count,
    'status', 'Healthy',
    'connected', true
  );
  
  RETURN res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_database_summary() TO authenticated;

-- Function to get specific table statistics
CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS TABLE (
  table_name TEXT,
  total_rows BIGINT,
  total_size TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    (SELECT n_live_tup FROM pg_stat_user_tables WHERE relname = t.table_name)::BIGINT AS total_rows,
    pg_size_pretty(pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"'))::TEXT AS total_size,
    'Active'::TEXT AS status
  FROM information_schema.tables t
  WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_table_statistics() TO authenticated;

SELECT 'Database Management RPC functions created successfully!' as status;
