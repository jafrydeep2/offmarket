# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4d8e1fbb-9032-4f16-99db-0d6ee936bc74

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4d8e1fbb-9032-4f16-99db-0d6ee936bc74) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4d8e1fbb-9032-4f16-99db-0d6ee936bc74) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Backend Setup (Supabase)

1) Environment variables (create `.env` from the example):

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

2) Database schema (run in Supabase SQL editor):

```sql
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

-- triggers to keep updated_at fresh
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
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

-- properties policies (public read, admins write via service or add extra checks as needed)
create policy "properties_read_all" on public.properties for select using (true);
create policy "properties_write_admin_only" on public.properties
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```

3) Development
- Run: `npm run dev`
- Ensure your `.env` contains correct Supabase keys.

4) Notes
- On signup, the app inserts a row into `profiles` with defaults.
- Admin routes are protected via `RequireAdmin` which checks `isAdmin` in the profile.
