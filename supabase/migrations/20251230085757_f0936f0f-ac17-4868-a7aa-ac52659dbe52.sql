-- Add serving_guide (JSONB) and choking_hazard_level columns to ref_foods
ALTER TABLE public.ref_foods 
ADD COLUMN serving_guide JSONB,
ADD COLUMN choking_hazard_level TEXT CHECK (choking_hazard_level IN ('Low', 'Moderate', 'High'));