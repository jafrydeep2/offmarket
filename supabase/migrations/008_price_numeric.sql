-- 008_price_numeric.sql

-- Add a numeric price column for matching budgets
alter table public.properties add column if not exists price_numeric numeric;

-- Trigger to keep price_numeric in sync by parsing text price like "CHF 2'800'000" or "2800000"
create or replace function public.set_price_numeric()
returns trigger as $$
declare
  cleaned text;
begin
  if new.price is null then
    new.price_numeric = null;
  else
    -- remove currency symbols, spaces, apostrophes, commas and non-digits
    cleaned := regexp_replace(new.price, '[^0-9\.]', '', 'g');
    if cleaned = '' then
      new.price_numeric = null;
    else
      new.price_numeric = cleaned::numeric;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_properties_price_numeric on public.properties;
create trigger set_properties_price_numeric before insert or update of price on public.properties
for each row execute procedure public.set_price_numeric();


