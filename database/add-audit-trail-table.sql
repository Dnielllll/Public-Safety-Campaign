-- Create audit_trail table for tracking user activities
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_trail
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_trail FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );

CREATE POLICY "Admins can view audit logs"
  ON public.audit_trail FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON public.audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.audit_trail(action);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.audit_trail TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
