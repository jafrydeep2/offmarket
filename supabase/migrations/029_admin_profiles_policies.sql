-- 029_admin_profiles_policies.sql
-- Add admin policies for profiles table to allow admins to manage user accounts

-- First, create a SECURITY DEFINER function to check admin status
-- This bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admin can read all profiles
-- Note: This policy allows users to read their own profiles (auth.uid() = id)
-- and admins to read any profile (public.is_admin())
-- The existing "profiles_read_own" policy from 001_init_schema.sql will also work
-- as policies are OR'd together
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
  );

-- Admin can insert profiles for other users (for account creation)
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );

-- Admin can update any profile
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  );

-- RPC function to update profile (uses security definer to bypass RLS if needed)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id uuid,
  p_username text DEFAULT NULL,
  p_subscription_type text DEFAULT NULL,
  p_subscription_expiry date DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_is_admin boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin using the helper function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_admin' USING MESSAGE = 'User not allowed';
  END IF;

  -- Update profile
  UPDATE public.profiles
  SET 
    username = COALESCE(p_username, username),
    subscription_type = COALESCE(p_subscription_type::text, subscription_type),
    subscription_expiry = COALESCE(p_subscription_expiry, subscription_expiry),
    is_active = COALESCE(p_is_active, is_active),
    is_admin = COALESCE(p_is_admin, is_admin),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_profile(uuid, text, text, date, boolean, boolean) TO authenticated;

-- Set the specified user as admin
-- This needs to be run with elevated privileges or after the user is already admin
-- For initial setup, you may need to run this directly in Supabase SQL editor
UPDATE public.profiles
SET is_admin = true, updated_at = now()
WHERE id = '2dd5e854-8a2f-49c0-8138-b4f40d5e0bc3';

