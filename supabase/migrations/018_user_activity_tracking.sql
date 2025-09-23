-- 018_user_activity_tracking.sql

-- User activity tracking table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'property_view', 'search', 'favorite_add', 'favorite_remove', 'inquiry', 'login', 'logout'
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  search_query text,
  search_filters jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamp with time zone DEFAULT now(),
  session_end timestamp with time zone,
  duration_seconds integer,
  page_views integer DEFAULT 0,
  properties_viewed integer DEFAULT 0,
  searches_performed integer DEFAULT 0,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Property views tracking
CREATE TABLE IF NOT EXISTS public.property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  referrer text,
  viewed_at timestamp with time zone DEFAULT now()
);

-- Search queries tracking
CREATE TABLE IF NOT EXISTS public.search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query text NOT NULL,
  filters jsonb,
  results_count integer,
  ip_address inet,
  user_agent text,
  searched_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_property_id ON public.user_activities(property_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON public.user_sessions(session_start);

CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON public.property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON public.property_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON public.search_queries(searched_at);

-- RLS Policies
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- User activities policies
CREATE POLICY "user_activities_insert_own" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_activities_select_own" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_activities_admin_all" ON public.user_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- User sessions policies
CREATE POLICY "user_sessions_insert_own" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_select_own" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_admin_all" ON public.user_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Property views policies (public insert, admin read)
CREATE POLICY "property_views_insert_all" ON public.property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "property_views_select_admin" ON public.property_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Search queries policies (public insert, admin read)
CREATE POLICY "search_queries_insert_all" ON public.search_queries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "search_queries_select_admin" ON public.search_queries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Function to track user activity
CREATE OR REPLACE FUNCTION public.track_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_property_id uuid DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_search_filters jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    property_id,
    search_query,
    search_filters,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_property_id,
    p_search_query,
    p_search_filters,
    COALESCE(p_metadata, '{}'::jsonb),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track property view
CREATE OR REPLACE FUNCTION public.track_property_view(
  p_property_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.property_views (
    property_id,
    user_id,
    ip_address,
    user_agent,
    referrer
  ) VALUES (
    p_property_id,
    p_user_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    current_setting('request.headers', true)::json->>'referer'
  );
  
  -- Update property views count
  UPDATE public.properties 
  SET views = views + 1 
  WHERE id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track search query
CREATE OR REPLACE FUNCTION public.track_search_query(
  p_user_id uuid,
  p_query text,
  p_filters jsonb DEFAULT NULL,
  p_results_count integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.search_queries (
    user_id,
    query,
    filters,
    results_count,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_query,
    p_filters,
    p_results_count,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
