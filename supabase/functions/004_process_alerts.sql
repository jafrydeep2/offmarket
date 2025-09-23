-- 004_process_alerts.sql

-- RPC: Given a property id, find matching alerts and enqueue emails
create or replace function public.process_property_alerts(p_property_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  prop record;
  r record;
  recipient_email text;
  recipient_firstname text;
  subject_text text;
  body_text text;
  body_html text;
begin
  select * into prop from public.properties where id = p_property_id;
  if not found then
    raise exception 'Property % not found', p_property_id;
  end if;

  for r in (
    select a.*, pr.email as user_email, coalesce(split_part(pr.username, ' ', 1), '') as first_name
    from public.property_alerts a
    join public.profiles pr on pr.id = a.user_id
    where a.transaction_type = coalesce(prop.listing_type, '')
      and a.property_type = prop.property_type
      and (a.max_budget is null or (prop.price_numeric is not null and prop.price_numeric <= a.max_budget))
  ) loop
    -- create or find match
    insert into public.alert_matches(alert_id, property_id)
    values (r.id, prop.id)
    on conflict do nothing;

    -- prepare email
    recipient_email := r.user_email;
    recipient_firstname := nullif(r.first_name, '');
    subject_text := 'New OFF Market Opportunity for You';
    body_text := format('Hello%s,\n\nA new property has just been added that could match your search criteria:\n\nLocation: %s\nType: %s\nPrice: %s\n\nView the property now: %s/property/%s\n\nThank you for being part of our exclusive OFF Market community.\n\nBest regards,\nLuxe Residences',
      case when recipient_firstname is not null then ' ' || recipient_firstname else '' end,
      coalesce(prop.city, ''), initcap(coalesce(prop.property_type, '')),
      coalesce(prop.price, ''), coalesce(current_setting('app.public_base_url', true), ''), prop.id);

    body_html := format('<p>Hello%s,</p><p>A new property has just been added that could match your search criteria:</p><ul><li><strong>Location:</strong> %s</li><li><strong>Type:</strong> %s</li><li><strong>Price:</strong> %s</li></ul><p><a href="%s/property/%s" target="_blank" style="background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">View the property</a></p><p>Thank you for being part of our exclusive OFF Market community.</p><p>Best regards,<br/>Luxe Residences</p>',
      case when recipient_firstname is not null then ' ' || recipient_firstname else '' end,
      coalesce(prop.city, ''), initcap(coalesce(prop.property_type, '')),
      coalesce(prop.price, ''), coalesce(current_setting('app.public_base_url', true), ''), prop.id);

    insert into public.email_queue(to_email, subject, body_text, body_html, meta)
    values (recipient_email, subject_text, body_text, body_html, jsonb_build_object('property_id', prop.id, 'alert_id', r.id));

    -- Create in-app notification for the user
    insert into public.notifications(user_id, title, message, type, action_url)
    values (r.user_id, 'New Property Match', 
            format('A new property "%s" matches your alert criteria', prop.title),
            'info', format('/property/%s', prop.id));

    -- Send email notification if user has email notifications enabled
    -- This will be handled by the application layer to respect user preferences
  end loop;
end;
$$;

revoke all on function public.process_property_alerts(uuid) from public;
grant execute on function public.process_property_alerts(uuid) to authenticated;


