-- 022_fix_inquiries_update_policy.sql
-- Add UPDATE policy for inquiries table to allow admins to update handled status

-- Add UPDATE policy for inquiries
CREATE POLICY "inquiries_admin_update" ON public.inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );
