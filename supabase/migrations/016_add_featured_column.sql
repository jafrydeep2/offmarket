-- 016_add_featured_column.sql

-- Add featured column to properties table
alter table public.properties add column if not exists featured boolean not null default false;

-- Add index for better performance on featured queries
create index if not exists idx_properties_featured on public.properties(featured);
