-- 005_storage_buckets.sql

-- Create buckets for property media (compatible with all Postgres versions)
insert into storage.buckets (id, name, public)
select 'properties-images', 'properties-images', true
where not exists (select 1 from storage.buckets where name = 'properties-images');

insert into storage.buckets (id, name, public)
select 'properties-videos', 'properties-videos', true
where not exists (select 1 from storage.buckets where name = 'properties-videos');

-- RLS policies for storage.objects
-- Public read for images and videos
drop policy if exists "public_read_images" on storage.objects;
create policy "public_read_images" on storage.objects
  for select using (bucket_id = 'properties-images');

drop policy if exists "public_read_videos" on storage.objects;
create policy "public_read_videos" on storage.objects
  for select using (bucket_id = 'properties-videos');

-- Authenticated can insert/update/delete; tighten to admins if desired
drop policy if exists "auth_write_images" on storage.objects;
create policy "auth_write_images" on storage.objects
  for all
  using (
    auth.role() = 'authenticated' and bucket_id = 'properties-images'
  ) with check (
    auth.role() = 'authenticated' and bucket_id = 'properties-images'
  );

drop policy if exists "auth_write_videos" on storage.objects;
create policy "auth_write_videos" on storage.objects
  for all
  using (
    auth.role() = 'authenticated' and bucket_id = 'properties-videos'
  ) with check (
    auth.role() = 'authenticated' and bucket_id = 'properties-videos'
  );


