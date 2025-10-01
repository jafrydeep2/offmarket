-- 026_fix_foreign_key_rls.sql
-- Fix foreign key constraint issues with RLS

-- The issue is that when inserting into inquiries, PostgreSQL needs to validate
-- the foreign key constraint to properties table, but RLS might be blocking this

-- First, let's ensure the properties table has the right policies for foreign key checks
-- Drop and recreate the properties policies to be more explicit

DROP POLICY IF EXISTS "properties_public_read" ON public.properties;
DROP POLICY IF EXISTS "properties_read_all" ON public.properties;
DROP POLICY IF EXISTS "properties_write_admin_only" ON public.properties;
DROP POLICY IF EXISTS "properties_admin_write" ON public.properties;

-- Create a comprehensive policy for properties that allows public read access
-- This is needed for foreign key constraint validation
CREATE POLICY "properties_public_read" ON public.properties
  FOR SELECT 
  TO public
  USING (true);

-- Admin write access
CREATE POLICY "properties_admin_write" ON public.properties
  FOR ALL 
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Now fix the inquiries policies
DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_read" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_update" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_allow_all_inserts" ON public.inquiries;

-- Create the simplest possible policy for inquiries
CREATE POLICY "inquiries_public_insert" ON public.inquiries
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Admin read access
CREATE POLICY "inquiries_admin_read" ON public.inquiries
  FOR SELECT 
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Admin update access
CREATE POLICY "inquiries_admin_update" ON public.inquiries
  FOR UPDATE 
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Add some debugging
DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been reset for both properties and inquiries tables';
  RAISE NOTICE 'Properties RLS enabled: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'properties');
  RAISE NOTICE 'Inquiries RLS enabled: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'inquiries');
END $$;
