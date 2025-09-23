-- 001_init_schema.sql

-- extensions
create extension if not exists pgcrypto;

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text,
  subscription_type text not null default 'basic',
  subscription_expiry date not null default '2099-12-31',
  is_active boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  city text not null,
  neighborhood text not null,
  address text,
  property_type text not null,
  rooms numeric not null,
  surface numeric not null,
  listing_type text,
  price text,
  availability_date date,
  availability_status text not null,
  images jsonb not null default '[]',
  video_url text,
  features jsonb not null default '[]',
  contact_info jsonb,
  views integer not null default 0,
  inquiries integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at before update on public.properties
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;

-- profiles policies
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

-- properties policies
drop policy if exists "properties_read_all" on public.properties;
create policy "properties_read_all" on public.properties for select using (true);
drop policy if exists "properties_write_admin_only" on public.properties;
create policy "properties_write_admin_only" on public.properties
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
