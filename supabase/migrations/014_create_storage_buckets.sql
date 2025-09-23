-- 014_create_storage_buckets.sql
-- Create storage buckets for media files

-- Create media-library bucket for general media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-library',
  'media-library',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf']
);

-- Create logos bucket specifically for logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Create RLS policies for media-library bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media-library');

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media-library' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media-library' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media-library' AND 
  auth.role() = 'authenticated'
);

-- Create RLS policies for logos bucket
CREATE POLICY "Public Access Logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Admin Upload Logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND 
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

CREATE POLICY "Admin Update Logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'logos' AND 
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

CREATE POLICY "Admin Delete Logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'logos' AND 
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);
