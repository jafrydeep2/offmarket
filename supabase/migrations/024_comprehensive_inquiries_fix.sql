-- 024_comprehensive_inquiries_fix.sql
-- Comprehensive fix for inquiries RLS policies

-- First, let's check if RLS is enabled and what policies exist
-- (This is just for debugging - we'll drop and recreate everything)

-- Drop ALL existing policies to ensure clean state
DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_read" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_update" ON public.inquiries;

-- Temporarily disable RLS to test if that's the issue
-- ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create the correct policies in the right order
-- 1. Allow public inserts (most permissive first)
CREATE POLICY "inquiries_public_insert" ON public.inquiries
  FOR INSERT 
  WITH CHECK (true);

-- 2. Allow admin reads
CREATE POLICY "inquiries_admin_read" ON public.inquiries
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- 3. Allow admin updates
CREATE POLICY "inquiries_admin_update" ON public.inquiries
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Add a comment for documentation
COMMENT ON TABLE public.inquiries IS 'Property inquiries - public can insert, admins can read/update';
