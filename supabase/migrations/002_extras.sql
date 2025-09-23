-- 002_extras.sql

-- favorites
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, property_id)
);

-- inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text,
  email text,
  phone text,
  message text,
  created_at timestamp with time zone default now()
);

-- contact messages (site-wide contact)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- membership applications (Become Member)
create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  profile text not null,
  project text not null,
  created_at timestamp with time zone default now()
);

alter table public.favorites enable row level security;
alter table public.inquiries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.membership_applications enable row level security;

-- favorites policies: users manage own favorites
drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = user_id);
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "inquiries_insert_all" on public.inquiries;
create policy "inquiries_insert_all" on public.inquiries for insert with check (true);
drop policy if exists "inquiries_select_admin" on public.inquiries;
create policy "inquiries_select_admin" on public.inquiries for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "contact_messages_insert_all" on public.contact_messages;
create policy "contact_messages_insert_all" on public.contact_messages for insert with check (true);
drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin" on public.contact_messages for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "membership_applications_insert_all" on public.membership_applications;
create policy "membership_applications_insert_all" on public.membership_applications for insert with check (true);
drop policy if exists "membership_applications_select_admin" on public.membership_applications;
create policy "membership_applications_select_admin" on public.membership_applications for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);
