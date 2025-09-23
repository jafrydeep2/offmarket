-- 003_rpc.sql

create or replace function public.increment_property_views(p_id uuid)
returns void
language sql
security definer
as $$
  update public.properties
  set views = coalesce(views, 0) + 1
  where id = p_id;
$$;

revoke all on function public.increment_property_views(uuid) from public;
grant execute on function public.increment_property_views(uuid) to anon, authenticated;

create or replace function public.increment_property_inquiries(p_id uuid)
returns void
language sql
security definer
as $$
  update public.properties
  set inquiries = coalesce(inquiries, 0) + 1
  where id = p_id;
$$;

revoke all on function public.increment_property_inquiries(uuid) from public;
grant execute on function public.increment_property_inquiries(uuid) to anon, authenticated;
