-- 021_fix_notification_rls.sql
-- Fix notification RLS policies to ensure admins can see all notifications

-- Drop existing policies
DROP POLICY IF EXISTS "admin_read_notifications" ON public.notifications;
DROP POLICY IF EXISTS "admin_insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "admin_update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "admin_delete_notifications" ON public.notifications;

-- Create comprehensive notification policies
CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT USING (
    -- Users can see their own notifications
    user_id = auth.uid() OR
    -- Admins can see all notifications
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

CREATE POLICY "notifications_insert_policy" ON public.notifications
  FOR INSERT WITH CHECK (
    -- Admins can create notifications for anyone
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    ) OR
    -- Users can create notifications for themselves (for testing)
    user_id = auth.uid()
  );

CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE USING (
    -- Users can update their own notifications (mark as read)
    user_id = auth.uid() OR
    -- Admins can update all notifications
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

CREATE POLICY "notifications_delete_policy" ON public.notifications
  FOR DELETE USING (
    -- Users can delete their own notifications
    user_id = auth.uid() OR
    -- Admins can delete all notifications
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Ensure the current user has admin privileges
-- This will be handled by the application layer
-- but we can add a function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
