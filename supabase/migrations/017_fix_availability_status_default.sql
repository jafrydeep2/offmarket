-- 017_fix_availability_status_default.sql

-- Add default value for availability_status column
alter table public.properties alter column availability_status set default 'immediate';

-- Update any existing records that might have null or invalid values
update public.properties 
set availability_status = 'immediate' 
where availability_status is null or availability_status not in ('immediate', 'arranged');

-- Add check constraint to ensure only valid values
alter table public.properties 
add constraint check_availability_status 
check (availability_status in ('immediate', 'arranged'));
