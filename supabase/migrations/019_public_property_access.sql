-- 019_public_property_access.sql

-- Update properties RLS policies to allow public access
-- Drop existing policies
DROP POLICY IF EXISTS "properties_read_all" ON public.properties;
DROP POLICY IF EXISTS "properties_write_admin_only" ON public.properties;

-- Create new policies for public read access
CREATE POLICY "properties_public_read" ON public.properties
  FOR SELECT USING (true);

-- Keep admin-only write access
CREATE POLICY "properties_admin_write" ON public.properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Update property_views to allow public inserts (for tracking)
DROP POLICY IF EXISTS "property_views_insert_all" ON public.property_views;
DROP POLICY IF EXISTS "property_views_select_admin" ON public.property_views;

CREATE POLICY "property_views_public_insert" ON public.property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "property_views_admin_read" ON public.property_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Update search_queries to allow public inserts (for tracking)
DROP POLICY IF EXISTS "search_queries_insert_all" ON public.search_queries;
DROP POLICY IF EXISTS "search_queries_select_admin" ON public.search_queries;

CREATE POLICY "search_queries_public_insert" ON public.search_queries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "search_queries_admin_read" ON public.search_queries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Update inquiries to allow public inserts
DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;

CREATE POLICY "inquiries_public_insert" ON public.inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "inquiries_admin_read" ON public.inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Update contact_messages to allow public inserts
DROP POLICY IF EXISTS "contact_messages_insert_all" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_admin" ON public.contact_messages;

CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Update membership_applications to allow public inserts
DROP POLICY IF EXISTS "membership_applications_insert_all" ON public.membership_applications;
DROP POLICY IF EXISTS "membership_applications_select_admin" ON public.membership_applications;

CREATE POLICY "membership_applications_public_insert" ON public.membership_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "membership_applications_admin_read" ON public.membership_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Update form_submissions to allow public inserts
DROP POLICY IF EXISTS "public_insert_form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "admin_view_form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "admin_update_form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "admin_delete_form_submissions" ON public.form_submissions;

CREATE POLICY "form_submissions_public_insert" ON public.form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "form_submissions_admin_all" ON public.form_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );
