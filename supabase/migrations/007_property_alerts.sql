-- 007_property_alerts.sql

-- Property Alerts core tables

create table if not exists public.property_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('rent','sale')),
  property_type text not null,
  max_budget numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.alert_matches (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.property_alerts(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  matched_at timestamp with time zone default now(),
  unique(alert_id, property_id)
);

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  body_text text,
  body_html text,
  meta jsonb default '{}'::jsonb,
  status text not null default 'pending', -- pending, sent, failed
  last_error text,
  created_at timestamp with time zone default now(),
  sent_at timestamp with time zone
);

-- indexes
create index if not exists idx_property_alerts_user on public.property_alerts(user_id);
create index if not exists idx_property_alerts_criteria on public.property_alerts(transaction_type, property_type);
create index if not exists idx_email_queue_status on public.email_queue(status, created_at);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_property_alerts_updated_at on public.property_alerts;
create trigger set_property_alerts_updated_at before update on public.property_alerts
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.property_alerts enable row level security;
alter table public.alert_matches enable row level security;
alter table public.email_queue enable row level security;

-- property_alerts policies (users manage their own alerts)
drop policy if exists "alerts_select_own" on public.property_alerts;
create policy "alerts_select_own" on public.property_alerts for select using (auth.uid() = user_id);
drop policy if exists "alerts_insert_own" on public.property_alerts;
create policy "alerts_insert_own" on public.property_alerts for insert with check (auth.uid() = user_id);
drop policy if exists "alerts_update_own" on public.property_alerts;
create policy "alerts_update_own" on public.property_alerts for update using (auth.uid() = user_id);
drop policy if exists "alerts_delete_own" on public.property_alerts;
create policy "alerts_delete_own" on public.property_alerts for delete using (auth.uid() = user_id);

-- alert_matches: readable by alert owners; inserts via definer functions only
drop policy if exists "alert_matches_read_via_owner" on public.alert_matches;
create policy "alert_matches_read_via_owner" on public.alert_matches
  for select using (
    exists (
      select 1 from public.property_alerts a
      where a.id = alert_id and a.user_id = auth.uid()
    )
  );

-- email_queue: no direct RLS access to regular users
drop policy if exists "email_queue_admin_read" on public.email_queue;
create policy "email_queue_admin_read" on public.email_queue for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- Allow admins to manage alerts and matches if needed
drop policy if exists "alerts_admin_all" on public.property_alerts;
create policy "alerts_admin_all" on public.property_alerts for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);
drop policy if exists "alert_matches_admin_all" on public.alert_matches;
create policy "alert_matches_admin_all" on public.alert_matches for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);


