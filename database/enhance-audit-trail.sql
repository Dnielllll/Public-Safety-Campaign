-- ============================================================
-- Enhanced Audit Trail System
-- ============================================================

-- 1. Update audit_trail table with additional fields
DO $$ 
BEGIN 
  -- Add new columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_trail' 
    AND column_name = 'ip_address'
  ) THEN 
    ALTER TABLE public.audit_trail ADD COLUMN ip_address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_trail' 
    AND column_name = 'user_agent'
  ) THEN 
    ALTER TABLE public.audit_trail ADD COLUMN user_agent TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_trail' 
    AND column_name = 'success'
  ) THEN 
    ALTER TABLE public.audit_trail ADD COLUMN success BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_trail' 
    AND column_name = 'error_message'
  ) THEN 
    ALTER TABLE public.audit_trail ADD COLUMN error_message TEXT;
  END IF;
END $$;

-- 2. Create comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_record RECORD;
  v_actor TEXT;
  v_audit_id BIGINT;
BEGIN
  -- Get user information for actor field
  SELECT u.name, u.email, u.role INTO v_user_record
  FROM public.users u
  WHERE u.id = v_user_id;

  -- Set actor based on user info
  IF v_user_record.name IS NOT NULL THEN
    v_actor := v_user_record.name || ' (' || v_user_record.role || ')';
  ELSE
    v_actor := 'System';
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_trail (
    actor,
    action,
    entity,
    user_id,
    entity_id,
    old_values,
    new_values,
    success,
    error_message,
    metadata
  ) VALUES (
    v_actor,
    p_action,
    p_entity,
    v_user_id,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_success,
    p_error_message,
    jsonb_build_object(
      'user_email', v_user_record.email,
      'user_role', v_user_record.role,
      'ip_address', p_old_values->>'ip_address',
      'timestamp', NOW()
    )
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id::UUID;
END;
$$;

-- 3. Create automatic audit triggers for key tables

-- Users table audit trigger
CREATE OR REPLACE FUNCTION public.audit_users_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'user.created',
      'users',
      NEW.id,
      NULL,
      jsonb_build_object(
        'email', NEW.email,
        'name', NEW.name,
        'role', NEW.role
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'user.updated',
      'users',
      NEW.id,
      jsonb_build_object(
        'name', OLD.name,
        'role', OLD.role,
        'phone', OLD.phone,
        'address', OLD.address
      ),
      jsonb_build_object(
        'name', NEW.name,
        'role', NEW.role,
        'phone', NEW.phone,
        'address', NEW.address
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'user.deleted',
      'users',
      OLD.id,
      jsonb_build_object(
        'email', OLD.email,
        'name', OLD.name,
        'role', OLD.role
      ),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Campaigns table audit trigger
CREATE OR REPLACE FUNCTION public.audit_campaigns_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'campaign.created',
      'campaigns',
      NEW.id,
      NULL,
      jsonb_build_object(
        'title', NEW.title,
        'status', NEW.status,
        'campaign_type', NEW.campaign_type
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'campaign.updated',
      'campaigns',
      NEW.id,
      jsonb_build_object(
        'title', OLD.title,
        'status', OLD.status
      ),
      jsonb_build_object(
        'title', NEW.title,
        'status', NEW.status
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'campaign.deleted',
      'campaigns',
      OLD.id,
      jsonb_build_object(
        'title', OLD.title,
        'status', OLD.status
      ),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Content table audit trigger
CREATE OR REPLACE FUNCTION public.audit_content_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'content.created',
      'content',
      NEW.id,
      NULL,
      jsonb_build_object(
        'content_type', NEW.content_type,
        'title', NEW.title,
        'ai_generated', NEW.ai_generated
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'content.updated',
      'content',
      NEW.id,
      jsonb_build_object(
        'title', OLD.title,
        'content_type', OLD.content_type
      ),
      jsonb_build_object(
        'title', NEW.title,
        'content_type', NEW.content_type
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'content.deleted',
      'content',
      OLD.id,
      jsonb_build_object(
        'title', OLD.title,
        'content_type', OLD.content_type
      ),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply triggers to tables
DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_users_changes();

DROP TRIGGER IF EXISTS audit_campaigns_trigger ON public.campaigns;
CREATE TRIGGER audit_campaigns_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.audit_campaigns_changes();

DROP TRIGGER IF EXISTS audit_content_trigger ON public.content;
CREATE TRIGGER audit_content_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.audit_content_changes();

-- 5. Update RLS policies for enhanced audit trail
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_trail;
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_trail FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('superadmin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_trail;
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

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_trail;
CREATE POLICY "System can insert audit logs"
  ON public.audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Create function to get audit statistics
CREATE OR REPLACE FUNCTION public.get_audit_statistics(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_logs', COUNT(*),
    'by_action', jsonb_agg(jsonb_build_object(action, action_count)),
    'by_entity', jsonb_agg(jsonb_build_object(entity, entity_count)),
    'success_rate', ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0), 2),
    'unique_users', COUNT(DISTINCT user_id)
  )
  INTO v_stats
  FROM (
    SELECT 
      action,
      entity,
      success,
      user_id,
      COUNT(*) OVER (PARTITION BY action) as action_count,
      COUNT(*) OVER (PARTITION BY entity) as entity_count
    FROM public.audit_trail
    WHERE timestamp >= NOW() - INTERVAL '1 day' * p_days
  ) subquery;

  RETURN v_stats;
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_statistics TO authenticated;

SELECT 'Enhanced audit trail system successfully deployed!' AS status;
