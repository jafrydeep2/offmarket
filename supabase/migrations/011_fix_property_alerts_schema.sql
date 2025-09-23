-- 011_fix_property_alerts_schema.sql
-- Fix property_alerts table schema to match frontend expectations

-- Add missing columns to property_alerts table
ALTER TABLE public.property_alerts 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS min_budget numeric,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS rooms numeric;

-- Add constraint for property_type to match frontend expectations
ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_property_type_check 
CHECK (property_type IN ('apartment', 'house', 'villa', 'land'));

-- Add constraint for rooms to be positive
ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_rooms_check 
CHECK (rooms IS NULL OR rooms > 0);

-- Add constraint for budgets to be positive
ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_min_budget_check 
CHECK (min_budget IS NULL OR min_budget > 0);

ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_max_budget_check 
CHECK (max_budget IS NULL OR max_budget > 0);

-- Add constraint for min_budget <= max_budget when both are present
ALTER TABLE public.property_alerts 
ADD CONSTRAINT property_alerts_budget_range_check 
CHECK (min_budget IS NULL OR max_budget IS NULL OR min_budget <= max_budget);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_alerts_is_active ON public.property_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_property_alerts_location ON public.property_alerts(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_alerts_rooms ON public.property_alerts(rooms) WHERE rooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_alerts_budget ON public.property_alerts(min_budget, max_budget) WHERE min_budget IS NOT NULL OR max_budget IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.property_alerts.is_active IS 'Whether the alert is active and should trigger notifications';
COMMENT ON COLUMN public.property_alerts.min_budget IS 'Minimum budget for the property search';
COMMENT ON COLUMN public.property_alerts.max_budget IS 'Maximum budget for the property search';
COMMENT ON COLUMN public.property_alerts.location IS 'Location filter for the property search';
COMMENT ON COLUMN public.property_alerts.rooms IS 'Number of rooms filter for the property search';
