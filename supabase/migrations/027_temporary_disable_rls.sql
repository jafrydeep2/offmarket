-- 027_temporary_disable_rls.sql
-- Temporarily disable RLS on inquiries to test if that's the issue

-- First, let's completely disable RLS on inquiries table
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_read" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_update" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_allow_all_inserts" ON public.inquiries;

-- Test if we can insert without RLS
-- This will help us determine if the issue is RLS or something else

-- Add some debugging
DO $$
BEGIN
  RAISE NOTICE 'RLS has been DISABLED on inquiries table for testing';
  RAISE NOTICE 'Inquiries RLS enabled: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'inquiries');
  RAISE NOTICE 'Properties RLS enabled: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'properties');
END $$;
