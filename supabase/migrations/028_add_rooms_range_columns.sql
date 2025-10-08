-- 028_add_rooms_range_columns.sql
-- Add min_rooms and max_rooms columns to property_alerts table

-- Add the new columns
ALTER TABLE public.property_alerts 
ADD COLUMN IF NOT EXISTS min_rooms numeric,
ADD COLUMN IF NOT EXISTS max_rooms numeric;

-- Add constraints for positive room values
ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_min_rooms_check 
CHECK (min_rooms IS NULL OR min_rooms > 0);

ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_max_rooms_check 
CHECK (max_rooms IS NULL OR max_rooms > 0);

-- Add constraint for min_rooms <= max_rooms when both are present
ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_rooms_range_check 
CHECK (min_rooms IS NULL OR max_rooms IS NULL OR min_rooms <= max_rooms);

-- Migrate existing rooms data to min_rooms
-- If there's existing rooms data, we'll set it as min_rooms
UPDATE public.property_alerts 
SET min_rooms = rooms 
WHERE rooms IS NOT NULL AND min_rooms IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_alerts_min_rooms ON public.property_alerts(min_rooms) WHERE min_rooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_alerts_max_rooms ON public.property_alerts(max_rooms) WHERE max_rooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_alerts_rooms_range ON public.property_alerts(min_rooms, max_rooms) WHERE min_rooms IS NOT NULL OR max_rooms IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.property_alerts.min_rooms IS 'Minimum number of rooms for the property search';
COMMENT ON COLUMN public.property_alerts.max_rooms IS 'Maximum number of rooms for the property search';

-- Note: We keep the old 'rooms' column for now to avoid breaking existing data
-- It can be removed in a future migration after confirming all data has been migrated
