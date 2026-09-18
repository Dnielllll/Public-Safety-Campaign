-- ============================================================
-- Improved Audit Trail System for Maximum Accuracy
-- ============================================================

-- 1. Recreate audit_trail table with proper structure
DROP TABLE IF EXISTS public.audit_trail CASCADE;

CREATE TABLE public.audit_trail (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create comprehensive indexes for performance
CREATE INDEX idx_audit_trail_timestamp ON public.audit_trail(timestamp DESC);
CREATE INDEX idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX idx_audit_trail_action ON public.audit_trail(action);
CREATE INDEX idx_audit_trail_entity ON public.audit_trail(entity);
CREATE INDEX idx_audit_trail_entity_id ON public.audit_trail(entity_id);
CREATE INDEX idx_audit_trail_success ON public.audit_trail(success);

-- 3. Enable RLS
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- 3.5 Enable Realtime for audit_trail table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_trail;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Create accurate RLS policies
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

-- 5. Create improved audit logging function with better accuracy
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_record RECORD;
  v_actor TEXT;
  v_audit_id BIGINT;
  v_metadata JSONB;
BEGIN
  -- Get user information for actor field
  SELECT u.name, u.email, u.role INTO v_user_record
  FROM public.users u
  WHERE u.id = v_user_id;

  -- Set actor based on user info with fallback
  IF v_user_record.name IS NOT NULL AND v_user_record.name != '' THEN
    v_actor := v_user_record.name || ' (' || COALESCE(v_user_record.role, 'unknown') || ')';
  ELSIF v_user_record.email IS NOT NULL AND v_user_record.email != '' THEN
    v_actor := v_user_record.email || ' (' || COALESCE(v_user_record.role, 'unknown') || ')';
  ELSE
    v_actor := 'System';
  END IF;

  -- Build comprehensive metadata
  v_metadata := jsonb_build_object(
    'user_email', COALESCE(v_user_record.email, 'system'),
    'user_role', COALESCE(v_user_record.role, 'system'),
    'ip_address', COALESCE(p_ip_address, 'unknown'),
    'user_agent', COALESCE(p_user_agent, 'unknown'),
    'logged_at', NOW(),
    'auth_uid', COALESCE(v_user_id::text, 'system')
  );

  -- Insert audit log with accurate data
  INSERT INTO public.audit_trail (
    actor,
    action,
    entity,
    entity_id,
    user_id,
    old_values,
    new_values,
    success,
    error_message,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    v_actor,
    p_action,
    p_entity,
    p_entity_id,
    v_user_id,
    COALESCE(p_old_values, '{}'::jsonb),
    COALESCE(p_new_values, '{}'::jsonb),
    p_success,
    p_error_message,
    p_ip_address,
    p_user_agent,
    v_metadata
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- 6. Create accurate triggers for comprehensive tracking

-- Users table audit trigger with comprehensive field tracking
CREATE OR REPLACE FUNCTION public.audit_users_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'user.created',
      'users',
      NEW.id,
      NULL::jsonb,
      jsonb_build_object(
        'email', NEW.email,
        'name', NEW.name,
        'role', NEW.role,
        'phone', NEW.phone,
        'address', NEW.address,
        'is_active', NEW.is_active,
        'allowed_modules', NEW.allowed_modules
      ),
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if there are actual changes
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM public.log_audit_event(
        'user.updated',
        'users',
        NEW.id,
        jsonb_build_object(
          'email', OLD.email,
          'name', OLD.name,
          'role', OLD.role,
          'phone', OLD.phone,
          'address', OLD.address,
          'is_active', OLD.is_active,
          'allowed_modules', OLD.allowed_modules
        ),
        jsonb_build_object(
          'email', NEW.email,
          'name', NEW.name,
          'role', NEW.role,
          'phone', NEW.phone,
          'address', NEW.address,
          'is_active', NEW.is_active,
          'allowed_modules', NEW.allowed_modules
        ),
        true,
        NULL,
        NULL,
        NULL
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'user.deleted',
      'users',
      OLD.id,
      jsonb_build_object(
        'email', OLD.email,
        'name', OLD.name,
        'role', OLD.role,
        'phone', OLD.phone,
        'address', OLD.address,
        'is_active', OLD.is_active
      ),
      NULL::jsonb,
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Campaigns table audit trigger with comprehensive tracking
CREATE OR REPLACE FUNCTION public.audit_campaigns_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'campaign.created',
      'campaigns',
      NEW.id,
      NULL::jsonb,
      jsonb_build_object(
        'title', NEW.title,
        'description', NEW.description,
        'status', NEW.status,
        'campaign_type', NEW.campaign_type,
        'target_audience', NEW.target_audience,
        'start_date', NEW.start_date,
        'end_date', NEW.end_date,
        'created_by', NEW.created_by
      ),
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM public.log_audit_event(
        'campaign.updated',
        'campaigns',
        NEW.id,
        jsonb_build_object(
          'title', OLD.title,
          'description', OLD.description,
          'status', OLD.status,
          'campaign_type', OLD.campaign_type,
          'target_audience', OLD.target_audience,
          'start_date', OLD.start_date,
          'end_date', OLD.end_date
        ),
        jsonb_build_object(
          'title', NEW.title,
          'description', NEW.description,
          'status', NEW.status,
          'campaign_type', NEW.campaign_type,
          'target_audience', NEW.target_audience,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date
        ),
        true,
        NULL,
        NULL,
        NULL
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'campaign.deleted',
      'campaigns',
      OLD.id,
      jsonb_build_object(
        'title', OLD.title,
        'description', OLD.description,
        'status', OLD.status,
        'campaign_type', OLD.campaign_type
      ),
      NULL::jsonb,
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Content table audit trigger with comprehensive tracking
CREATE OR REPLACE FUNCTION public.audit_content_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'content.created',
      'content',
      NEW.id,
      NULL::jsonb,
      jsonb_build_object(
        'campaign_id', NEW.campaign_id,
        'content_type', NEW.content_type,
        'title', NEW.title,
        'body', NEW.body,
        'media_url', NEW.media_url,
        'ai_generated', NEW.ai_generated,
        'order_index', NEW.order_index
      ),
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM public.log_audit_event(
        'content.updated',
        'content',
        NEW.id,
        jsonb_build_object(
          'campaign_id', OLD.campaign_id,
          'content_type', OLD.content_type,
          'title', OLD.title,
          'body', OLD.body,
          'media_url', OLD.media_url,
          'ai_generated', OLD.ai_generated,
          'order_index', OLD.order_index
        ),
        jsonb_build_object(
          'campaign_id', NEW.campaign_id,
          'content_type', NEW.content_type,
          'title', NEW.title,
          'body', NEW.body,
          'media_url', NEW.media_url,
          'ai_generated', NEW.ai_generated,
          'order_index', NEW.order_index
        ),
        true,
        NULL,
        NULL,
        NULL
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'content.deleted',
      'content',
      OLD.id,
      jsonb_build_object(
        'campaign_id', OLD.campaign_id,
        'content_type', OLD.content_type,
        'title', OLD.title,
        'media_url', OLD.media_url
      ),
      NULL::jsonb,
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Notifications table audit trigger
CREATE OR REPLACE FUNCTION public.audit_notifications_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'notification.created',
      'notifications',
      NEW.id,
      NULL::jsonb,
      jsonb_build_object(
        'recipient_id', NEW.recipient_id,
        'campaign_id', NEW.campaign_id,
        'title', NEW.title,
        'type', NEW.type,
        'status', NEW.status,
        'channels', NEW.channels
      ),
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM public.log_audit_event(
        'notification.updated',
        'notifications',
        NEW.id,
        jsonb_build_object(
          'status', OLD.status,
          'read_at', OLD.read_at
        ),
        jsonb_build_object(
          'status', NEW.status,
          'read_at', NEW.read_at
        ),
        true,
        NULL,
        NULL,
        NULL
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'notification.deleted',
      'notifications',
      OLD.id,
      jsonb_build_object(
        'recipient_id', OLD.recipient_id,
        'title', OLD.title
      ),
      NULL::jsonb,
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Feedback table audit trigger
CREATE OR REPLACE FUNCTION public.audit_feedback_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'feedback.created',
      'feedback',
      NEW.id,
      NULL::jsonb,
      jsonb_build_object(
        'campaign_id', NEW.campaign_id,
        'user_id', NEW.user_id,
        'rating', NEW.rating,
        'comment', NEW.comment
      ),
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM public.log_audit_event(
        'feedback.updated',
        'feedback',
        NEW.id,
        jsonb_build_object(
          'response', OLD.response,
          'responded_by', OLD.responded_by
        ),
        jsonb_build_object(
          'response', NEW.response,
          'responded_by', NEW.responded_by
        ),
        true,
        NULL,
        NULL,
        NULL
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'feedback.deleted',
      'feedback',
      OLD.id,
      jsonb_build_object(
        'user_id', OLD.user_id,
        'rating', OLD.rating
      ),
      NULL::jsonb,
      true,
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply triggers to tables
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

DROP TRIGGER IF EXISTS audit_notifications_trigger ON public.notifications;
CREATE TRIGGER audit_notifications_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_notifications_changes();

DROP TRIGGER IF EXISTS audit_feedback_trigger ON public.feedback;
CREATE TRIGGER audit_feedback_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.audit_feedback_changes();

-- 8. Create accurate audit statistics function
CREATE OR REPLACE FUNCTION public.get_audit_statistics(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_total_logs BIGINT;
  v_successful_logs BIGINT;
  v_unique_users BIGINT;
BEGIN
  -- Get basic counts
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN success THEN 1 END) as successful,
    COUNT(DISTINCT user_id) as unique_users
  INTO v_total_logs, v_successful_logs, v_unique_users
  FROM public.audit_trail
  WHERE timestamp >= NOW() - INTERVAL '1 day' * p_days;

  -- Build accurate statistics
  v_stats := jsonb_build_object(
    'total_logs', v_total_logs,
    'successful_logs', v_successful_logs,
    'failed_logs', v_total_logs - v_successful_logs,
    'success_rate', CASE 
      WHEN v_total_logs > 0 THEN 
        ROUND(100.0 * v_successful_logs::NUMERIC / v_total_logs, 2)
      ELSE 
        0 
    END,
    'unique_users', v_unique_users,
    'period_days', p_days,
    'from_date', (NOW() - INTERVAL '1 day' * p_days)::text,
    'to_date', NOW()::text
  );

  -- Add action breakdown
  v_stats := v_stats || jsonb_build_object(
    'actions_by_count', (
      SELECT jsonb_agg(jsonb_build_object(
        'action', action,
        'count', action_count
      ))
      FROM (
        SELECT action, COUNT(*) as action_count
        FROM public.audit_trail
        WHERE timestamp >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY action
        ORDER BY action_count DESC
        LIMIT 10
      ) subquery
    )
  );

  -- Add entity breakdown
  v_stats := v_stats || jsonb_build_object(
    'entities_by_count', (
      SELECT jsonb_agg(jsonb_build_object(
        'entity', entity,
        'count', entity_count
      ))
      FROM (
        SELECT entity, COUNT(*) as entity_count
        FROM public.audit_trail
        WHERE timestamp >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY entity
        ORDER BY entity_count DESC
        LIMIT 10
      ) subquery
    )
  );

  RETURN v_stats;
END;
$$;

-- 9. Create function to get detailed audit log with context
CREATE OR REPLACE FUNCTION public.get_audit_log_details(p_log_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_details JSONB;
BEGIN
  SELECT jsonb_build_object(
    'log', jsonb_build_object(
      'id', id,
      'actor', actor,
      'action', action,
      'entity', entity,
      'entity_id', entity_id,
      'user_id', user_id,
      'old_values', old_values,
      'new_values', new_values,
      'success', success,
      'error_message', error_message,
      'ip_address', ip_address,
      'user_agent', user_agent,
      'timestamp', timestamp,
      'metadata', metadata
    ),
    'related_user', (
      SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'role', u.role
      )
      FROM public.users u
      WHERE u.id = audit_trail.user_id
    )
  )
  INTO v_log_details
  FROM public.audit_trail
  WHERE id = p_log_id;

  RETURN v_log_details;
END;
$$;

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_log_details TO authenticated;

-- 11. Insert some sample audit logs for testing
INSERT INTO public.audit_trail (actor, action, entity, user_id, old_values, new_values, success, metadata)
VALUES 
  ('System', 'system.initialized', 'audit_trail', NULL, NULL, jsonb_build_object('version', '2.0'), true, jsonb_build_object('init', true)),
  ('Admin User (admin)', 'user.login', 'auth', NULL, NULL, jsonb_build_object('method', 'email'), true, jsonb_build_object('user_email', 'admin@example.com'));

SELECT 'Improved audit trail system with maximum accuracy deployed successfully!' AS status;
