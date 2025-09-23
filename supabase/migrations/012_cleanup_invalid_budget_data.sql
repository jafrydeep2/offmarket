-- 012_cleanup_invalid_budget_data.sql
-- Clean up any existing data that violates the new budget constraints

-- Update any records with min_budget = 0 to NULL
UPDATE public.property_alerts 
SET min_budget = NULL 
WHERE min_budget = 0;

-- Update any records with max_budget = 0 to NULL  
UPDATE public.property_alerts 
SET max_budget = NULL 
WHERE max_budget = 0;

-- Update any records with negative budgets to NULL
UPDATE public.property_alerts 
SET min_budget = NULL 
WHERE min_budget < 0;

UPDATE public.property_alerts 
SET max_budget = NULL 
WHERE max_budget < 0;
