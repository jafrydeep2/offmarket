-- 013_premium_admin_features.sql
-- Premium Admin Panel Database Schema

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_key_unique UNIQUE (key)
);

-- Admin Actions Audit Log
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  body_html text,
  body_text text,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_templates_name_unique UNIQUE (name)
);

-- System Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info', -- info, warning, error, success
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- User Activity Tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- login, logout, property_view, inquiry, etc.
  target_type text, -- property, inquiry, etc.
  target_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Media Library
CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  alt_text text,
  tags text[],
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Property Categories
CREATE TABLE IF NOT EXISTS public.property_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT property_categories_slug_unique UNIQUE (slug)
);

-- Email Queue for Bulk Communications
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL,
  body_html text,
  body_text text,
  template_id uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
  variables jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending', -- pending, sent, failed, cancelled
  priority integer DEFAULT 0,
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  properties jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- System Health Monitoring
CREATE TABLE IF NOT EXISTS public.system_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  unit text,
  status text NOT NULL, -- healthy, warning, critical
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_metric_name ON public.system_health(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_created_at ON public.system_health(created_at);

-- Updated_at triggers
DROP TRIGGER IF EXISTS set_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER set_system_settings_updated_at 
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER set_email_templates_updated_at 
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_property_categories_updated_at ON public.property_categories;
CREATE TRIGGER set_property_categories_updated_at 
  BEFORE UPDATE ON public.property_categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS Policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for most tables
DROP POLICY IF EXISTS "admin_only_system_settings" ON public.system_settings;
CREATE POLICY "admin_only_system_settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_admin_actions" ON public.admin_actions;
CREATE POLICY "admin_only_admin_actions" ON public.admin_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_email_templates" ON public.email_templates;
CREATE POLICY "admin_only_email_templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_read_notifications" ON public.notifications;
CREATE POLICY "admin_read_notifications" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_insert_notifications" ON public.notifications;
CREATE POLICY "admin_insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_update_notifications" ON public.notifications;
CREATE POLICY "admin_update_notifications" ON public.notifications
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_user_activity" ON public.user_activity;
CREATE POLICY "admin_only_user_activity" ON public.user_activity
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_media_library" ON public.media_library;
CREATE POLICY "admin_only_media_library" ON public.media_library
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_property_categories" ON public.property_categories;
CREATE POLICY "admin_only_property_categories" ON public.property_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_email_queue" ON public.email_queue;
CREATE POLICY "admin_only_email_queue" ON public.email_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_analytics_events" ON public.analytics_events;
CREATE POLICY "admin_only_analytics_events" ON public.analytics_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_only_system_health" ON public.system_health;
CREATE POLICY "admin_only_system_health" ON public.system_health
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('site_name', '"Exclusimmo"', 'Site name'),
('site_tagline', '"Exclusive access to off-market properties"', 'Site tagline'),
('default_language', '"fr"', 'Default language'),
('maintenance_mode', 'false', 'Maintenance mode status'),
('email_sender_name', '"Exclusimmo"', 'Default email sender name'),
('email_sender_email', '"noreply@offmarket.ch"', 'Default email sender email'),
('email_reply_to', '"support@offmarket.ch"', 'Default reply-to email'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', '["image/jpeg", "image/png", "image/webp", "video/mp4"]', 'Allowed file types for uploads'),
('subscription_expiry_warning_days', '30', 'Days before subscription expiry to send warning'),
('analytics_enabled', 'true', 'Enable analytics tracking'),
('backup_enabled', 'true', 'Enable automatic backups'),
('backup_frequency', '"daily"', 'Backup frequency'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('session_timeout', '3600', 'Session timeout in seconds'),
('logo_url', 'null', 'Site logo URL')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- Insert default property categories
INSERT INTO public.property_categories (name, slug, description, icon, sort_order) VALUES
('Apartment', 'apartment', 'Residential apartments', 'building', 1),
('House', 'house', 'Single-family houses', 'home', 2),
('Loft', 'loft', 'Modern lofts', 'layers', 3),
('Penthouse', 'penthouse', 'Luxury penthouses', 'trending-up', 4),
('Studio', 'studio', 'Studio apartments', 'square', 5),
('Duplex', 'duplex', 'Two-level apartments', 'layers-3', 6),
('Villa', 'villa', 'Luxury villas', 'crown', 7),
('Chalet', 'chalet', 'Mountain chalets', 'mountain', 8),
('Castle', 'castle', 'Historic castles', 'shield', 9)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body_html, body_text, variables) VALUES
('welcome', 'Welcome to Exclusimmo', '<h1>Welcome {{name}}!</h1><p>Thank you for joining Exclusimmo.</p>', 'Welcome {{name}}! Thank you for joining Exclusimmo.', '["name", "email"]'),
('subscription_expiry', 'Your subscription expires soon', '<h1>Subscription Expiry Notice</h1><p>Your subscription expires in {{days}} days.</p>', 'Your subscription expires in {{days}} days.', '["name", "days", "expiry_date"]'),
('subscription_expired', 'Your subscription has expired', '<h1>Subscription Expired</h1><p>Your subscription expired on {{expiry_date}}.</p>', 'Your subscription expired on {{expiry_date}}.', '["name", "expiry_date"]'),
('new_property', 'New property available', '<h1>New Property Available</h1><p>A new property matching your criteria is now available: {{property_title}}</p>', 'New property available: {{property_title}}', '["name", "property_title", "property_url"]'),
('password_reset', 'Reset your password', '<h1>Password Reset</h1><p>Click here to reset your password: {{reset_url}}</p>', 'Reset your password: {{reset_url}}', '["name", "reset_url"]')
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = now();
