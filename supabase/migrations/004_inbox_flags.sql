-- 004_inbox_flags.sql

alter table public.inquiries add column if not exists handled boolean not null default false;
alter table public.contact_messages add column if not exists handled boolean not null default false;
alter table public.membership_applications add column if not exists handled boolean not null default false;
