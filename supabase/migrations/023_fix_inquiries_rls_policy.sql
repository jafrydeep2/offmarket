-- 023_fix_inquiries_rls_policy.sql
-- Fix the malformed inquiries RLS policy

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_read" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_admin_update" ON public.inquiries;

-- Create the correct policies
-- Allow anyone to insert inquiries (public access)
CREATE POLICY "inquiries_public_insert" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- Allow admins to read all inquiries
CREATE POLICY "inquiries_admin_read" ON public.inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Allow admins to update inquiries
CREATE POLICY "inquiries_admin_update" ON public.inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );
