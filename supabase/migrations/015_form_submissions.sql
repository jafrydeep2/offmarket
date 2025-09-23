-- 015_form_submissions.sql
-- Create form submissions table for all user forms

-- Form submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL, -- 'membership', 'private_sales', 'property_videos', 'exclusive_access', 'property_finder', 'contact'
  first_name text,
  last_name text,
  full_name text,
  email text NOT NULL,
  phone text,
  property_type text,
  location text,
  budget text,
  interest text,
  profile text,
  project text,
  message text,
  status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  handled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON public.form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON public.form_submissions(email);

-- Updated_at trigger
DROP TRIGGER IF EXISTS set_form_submissions_updated_at ON public.form_submissions;
CREATE TRIGGER set_form_submissions_updated_at 
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS Policies
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Public can insert form submissions
CREATE POLICY "public_insert_form_submissions" ON public.form_submissions
  FOR INSERT WITH CHECK (true);

-- Admins can view all form submissions
CREATE POLICY "admin_view_form_submissions" ON public.form_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Admins can update form submissions
CREATE POLICY "admin_update_form_submissions" ON public.form_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Admins can delete form submissions
CREATE POLICY "admin_delete_form_submissions" ON public.form_submissions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );
