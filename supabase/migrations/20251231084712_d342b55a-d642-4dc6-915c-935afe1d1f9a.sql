-- Create enums for strict typing
CREATE TYPE public.food_category AS ENUM ('Dairy', 'Fruit', 'Vegetable', 'Grain', 'Legume', 'Protein');
CREATE TYPE public.allergen_type AS ENUM ('egg', 'dairy', 'peanut', 'tree_nut', 'sesame', 'soy', 'wheat', 'fish', 'shellfish');
CREATE TYPE public.age_range AS ENUM ('6_9_months', '9_12_months', '12_24_months');
CREATE TYPE public.texture_type AS ENUM ('puree', 'mashed', 'finely_chopped', 'minced', 'shredded', 'soft_strips', 'bite_sized');
CREATE TYPE public.reaction_severity AS ENUM ('none', 'mild', 'moderate', 'severe');

-- Create new foods table (replacing ref_foods)
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL UNIQUE,
  category food_category NOT NULL,
  is_allergen BOOLEAN NOT NULL DEFAULT false,
  allergen_type allergen_type,
  choking_risk BOOLEAN NOT NULL DEFAULT false,
  prep_notes TEXT NOT NULL,
  min_age_months INTEGER NOT NULL DEFAULT 6,
  excluded_under_12m BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on foods
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Anyone can view active foods
CREATE POLICY "Anyone can view active foods"
ON public.foods
FOR SELECT
USING (active = true);

-- Create food_serving_guidelines table
CREATE TABLE public.food_serving_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  age_range age_range NOT NULL,
  texture texture_type NOT NULL,
  serving_notes TEXT NOT NULL,
  choking_warning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(food_id, age_range)
);

-- Enable RLS on food_serving_guidelines
ALTER TABLE public.food_serving_guidelines ENABLE ROW LEVEL SECURITY;

-- Anyone can view serving guidelines
CREATE POLICY "Anyone can view serving guidelines"
ON public.food_serving_guidelines
FOR SELECT
USING (true);

-- Create food_exposures table (new unified tracking table)
CREATE TABLE public.food_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  date_introduced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  age_at_exposure_months INTEGER,
  reaction reaction_severity NOT NULL DEFAULT 'none',
  reaction_notes TEXT,
  confirmed_safe BOOLEAN NOT NULL DEFAULT false,
  exposure_count INTEGER NOT NULL DEFAULT 1,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on food_exposures
ALTER TABLE public.food_exposures ENABLE ROW LEVEL SECURITY;

-- Users can view their own exposures
CREATE POLICY "Users can view their own exposures"
ON public.food_exposures
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own exposures
CREATE POLICY "Users can insert their own exposures"
ON public.food_exposures
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own exposures
CREATE POLICY "Users can update their own exposures"
ON public.food_exposures
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own exposures
CREATE POLICY "Users can delete their own exposures"
ON public.food_exposures
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on foods
CREATE TRIGGER update_foods_updated_at
BEFORE UPDATE ON public.foods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on food_exposures
CREATE TRIGGER update_food_exposures_updated_at
BEFORE UPDATE ON public.food_exposures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_is_allergen ON public.foods(is_allergen);
CREATE INDEX idx_foods_active ON public.foods(active);
CREATE INDEX idx_food_serving_guidelines_food_id ON public.food_serving_guidelines(food_id);
CREATE INDEX idx_food_serving_guidelines_age_range ON public.food_serving_guidelines(age_range);
CREATE INDEX idx_food_exposures_user_id ON public.food_exposures(user_id);
CREATE INDEX idx_food_exposures_food_id ON public.food_exposures(food_id);