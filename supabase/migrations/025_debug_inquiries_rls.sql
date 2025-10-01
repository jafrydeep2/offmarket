-- 025_debug_inquiries_rls.sql
-- Debug and fix inquiries RLS issue

-- First, let's completely disable RLS temporarily to test if that's the issue
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;

-- Test if we can insert without RLS
-- (This will help us determine if the issue is RLS or something else)

-- Now let's re-enable RLS and create a very simple policy
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_read" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_update" ON public.inquiries;

-- Create the simplest possible policy for inserts
CREATE POLICY "inquiries_allow_all_inserts" ON public.inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create admin read policy
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

-- Add some debugging info
DO $$
BEGIN
  RAISE NOTICE 'Inquiries RLS policies have been reset and simplified';
  RAISE NOTICE 'RLS is enabled: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'inquiries');
END $$;
