-- Create tip_rules table for contextual tips based on food triggers
CREATE TABLE public.tip_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_category TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  action_label TEXT,
  action_food_id INTEGER REFERENCES public.ref_foods(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create general_tips table for fallback tips
CREATE TABLE public.general_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tip_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_tips ENABLE ROW LEVEL SECURITY;

-- Create public read policies (tips are reference data)
CREATE POLICY "Anyone can view tip rules" 
ON public.tip_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view general tips" 
ON public.general_tips 
FOR SELECT 
USING (true);