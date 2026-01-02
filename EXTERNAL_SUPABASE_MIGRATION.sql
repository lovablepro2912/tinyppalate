-- ============================================
-- TINYPALATE - CONSOLIDATED SUPABASE MIGRATION
-- Run this in your external Supabase SQL Editor
-- ============================================

-- =====================
-- PART 1: ENUMS/TYPES
-- =====================

CREATE TYPE public.food_category AS ENUM ('Dairy', 'Fruit', 'Vegetable', 'Grain', 'Legume', 'Protein');
CREATE TYPE public.allergen_type AS ENUM ('egg', 'dairy', 'peanut', 'tree_nut', 'sesame', 'soy', 'wheat', 'fish', 'shellfish');
CREATE TYPE public.age_range AS ENUM ('6_9_months', '9_12_months', '12_24_months');
CREATE TYPE public.texture_type AS ENUM ('puree', 'mashed', 'finely_chopped', 'minced', 'shredded', 'soft_strips', 'bite_sized');
CREATE TYPE public.reaction_severity AS ENUM ('none', 'mild', 'moderate', 'severe');

-- =====================
-- PART 2: FUNCTIONS
-- =====================

-- Handle new user signup - auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, baby_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'baby_name', 'Baby'));
  RETURN new;
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Delete user account function
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.food_logs WHERE user_id = auth.uid();
  DELETE FROM public.user_food_states WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- =====================
-- PART 3: TABLES
-- =====================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_name TEXT NOT NULL DEFAULT 'Baby',
  birth_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ref_foods table (master list of foods)
CREATE TABLE public.ref_foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_allergen BOOLEAN NOT NULL DEFAULT false,
  allergen_family TEXT,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  image_url TEXT,
  serving_guide JSONB,
  choking_hazard_level TEXT CHECK (choking_hazard_level IN ('Low', 'Moderate', 'High')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ref_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view foods"
  ON public.ref_foods FOR SELECT
  USING (true);

-- user_food_states table
CREATE TABLE public.user_food_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL REFERENCES public.ref_foods(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'TO_TRY' CHECK (status IN ('TO_TRY', 'TRYING', 'SAFE', 'REACTION')),
  exposure_count INTEGER NOT NULL DEFAULT 0,
  last_eaten TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, food_id)
);

ALTER TABLE public.user_food_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own food states"
  ON public.user_food_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food states"
  ON public.user_food_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food states"
  ON public.user_food_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food states"
  ON public.user_food_states FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_food_states_updated_at
  BEFORE UPDATE ON public.user_food_states
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- food_logs table
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_food_state_id UUID NOT NULL REFERENCES public.user_food_states(id) ON DELETE CASCADE,
  reaction_severity SMALLINT NOT NULL DEFAULT 0 CHECK (reaction_severity IN (0, 1, 2)),
  notes TEXT DEFAULT '',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON public.food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON public.food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON public.food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON public.food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- foods table (new expanded version)
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL UNIQUE,
  category public.food_category NOT NULL,
  is_allergen BOOLEAN NOT NULL DEFAULT false,
  allergen_type public.allergen_type,
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

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active foods"
  ON public.foods FOR SELECT
  USING (active = true);

CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_is_allergen ON public.foods(is_allergen);
CREATE INDEX idx_foods_active ON public.foods(active);

-- food_serving_guidelines table
CREATE TABLE public.food_serving_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  age_range public.age_range NOT NULL,
  texture public.texture_type NOT NULL,
  serving_notes TEXT NOT NULL,
  choking_warning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(food_id, age_range)
);

ALTER TABLE public.food_serving_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view serving guidelines"
  ON public.food_serving_guidelines FOR SELECT
  USING (true);

CREATE INDEX idx_food_serving_guidelines_food_id ON public.food_serving_guidelines(food_id);
CREATE INDEX idx_food_serving_guidelines_age_range ON public.food_serving_guidelines(age_range);

-- food_exposures table
CREATE TABLE public.food_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  date_introduced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  age_at_exposure_months INTEGER,
  reaction public.reaction_severity NOT NULL DEFAULT 'none',
  reaction_notes TEXT,
  confirmed_safe BOOLEAN NOT NULL DEFAULT false,
  exposure_count INTEGER NOT NULL DEFAULT 1,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.food_exposures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exposures"
  ON public.food_exposures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exposures"
  ON public.food_exposures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exposures"
  ON public.food_exposures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exposures"
  ON public.food_exposures FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_food_exposures_updated_at
  BEFORE UPDATE ON public.food_exposures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_food_exposures_user_id ON public.food_exposures(user_id);
CREATE INDEX idx_food_exposures_food_id ON public.food_exposures(food_id);

-- tip_rules table
CREATE TABLE public.tip_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_category TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  action_label TEXT,
  action_food_id INTEGER REFERENCES public.ref_foods(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tip_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tip rules" 
  ON public.tip_rules FOR SELECT 
  USING (true);

-- general_tips table
CREATE TABLE public.general_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.general_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view general tips" 
  ON public.general_tips FOR SELECT 
  USING (true);

-- device_tokens table
CREATE TABLE public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own device tokens"
  ON public.device_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens"
  ON public.device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens"
  ON public.device_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens"
  ON public.device_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  allergen_maintenance BOOLEAN NOT NULL DEFAULT true,
  allergen_progress BOOLEAN NOT NULL DEFAULT true,
  allergen_reminder BOOLEAN NOT NULL DEFAULT true,
  allergen_reminder_time TIME NOT NULL DEFAULT '10:00:00',
  daily_reminder BOOLEAN NOT NULL DEFAULT true,
  daily_reminder_time TIME NOT NULL DEFAULT '18:00',
  milestones BOOLEAN NOT NULL DEFAULT true,
  reaction_followup BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- notification_log table
CREATE TABLE public.notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  reference_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification log"
  ON public.notification_log FOR SELECT
  USING (auth.uid() = user_id);

-- user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" 
  ON public.user_achievements FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  revenuecat_customer_id text,
  entitlement_active boolean NOT NULL DEFAULT false,
  product_id text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- PART 4: STORAGE
-- =====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view food images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

CREATE POLICY "Service role can upload food images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'food-images');

-- =====================
-- PART 5: SEED DATA
-- =====================

-- Initial ref_foods data (you'll need to export the full data from Lovable Cloud)
INSERT INTO public.ref_foods (name, category, is_allergen, allergen_family, emoji) VALUES
-- Fruits
('Avocado', 'Fruit', false, NULL, '🥑'),
('Banana', 'Fruit', false, NULL, '🍌'),
('Apple', 'Fruit', false, NULL, '🍎'),
('Mango', 'Fruit', false, NULL, '🥭'),
('Blueberries', 'Fruit', false, NULL, '🫐'),
('Strawberries', 'Fruit', false, NULL, '🍓'),
('Peach', 'Fruit', false, NULL, '🍑'),
('Pear', 'Fruit', false, NULL, '🍐'),
('Watermelon', 'Fruit', false, NULL, '🍉'),
('Grapes', 'Fruit', false, NULL, '🍇'),
('Orange', 'Fruit', false, NULL, '🍊'),
('Kiwi', 'Fruit', false, NULL, '🥝'),
-- Vegetables
('Sweet Potato', 'Vegetable', false, NULL, '🍠'),
('Carrots', 'Vegetable', false, NULL, '🥕'),
('Broccoli', 'Vegetable', false, NULL, '🥦'),
('Peas', 'Vegetable', false, NULL, '🟢'),
('Spinach', 'Vegetable', false, NULL, '🥬'),
('Zucchini', 'Vegetable', false, NULL, '🥒'),
('Butternut Squash', 'Vegetable', false, NULL, '🎃'),
('Green Beans', 'Vegetable', false, NULL, '🫛'),
('Cauliflower', 'Vegetable', false, NULL, '🥬'),
('Corn', 'Vegetable', false, NULL, '🌽'),
('Potato', 'Vegetable', false, NULL, '🥔'),
('Cucumber', 'Vegetable', false, NULL, '🥒'),
-- Proteins
('Chicken', 'Protein', false, NULL, '🍗'),
('Beef', 'Protein', false, NULL, '🥩'),
('Turkey', 'Protein', false, NULL, '🦃'),
('Tofu', 'Protein', false, NULL, '🧈'),
('Lentils', 'Protein', false, NULL, '🫘'),
('Black Beans', 'Protein', false, NULL, '🫘'),
('Chickpeas', 'Protein', false, NULL, '🫘'),
('Pork', 'Protein', false, NULL, '🥓'),
('Lamb', 'Protein', false, NULL, '🍖'),
-- Grains
('Oatmeal', 'Grain', false, NULL, '🥣'),
('Rice', 'Grain', false, NULL, '🍚'),
('Quinoa', 'Grain', false, NULL, '🌾'),
('Pasta', 'Grain', false, NULL, '🍝'),
('Barley', 'Grain', false, NULL, '🌾'),
-- Dairy (non-allergen forms)
('Yogurt', 'Dairy', false, NULL, '🥛'),
('Cheese', 'Dairy', false, NULL, '🧀'),
-- Top 9 Allergens
('Peanut Butter', 'Common Allergen', true, 'Peanut', '🥜'),
('Scrambled Egg', 'Common Allergen', true, 'Egg', '🥚'),
('Whole Milk', 'Common Allergen', true, 'Dairy', '🥛'),
('Soy Milk', 'Common Allergen', true, 'Soy', '🫛'),
('Wheat Bread', 'Common Allergen', true, 'Wheat', '🍞'),
('Salmon', 'Common Allergen', true, 'Fish', '🐟'),
('Shrimp', 'Common Allergen', true, 'Shellfish', '🦐'),
('Sesame Tahini', 'Common Allergen', true, 'Sesame', '🫓'),
('Almond Butter', 'Common Allergen', true, 'Tree Nut', '🌰'),
('Egg Yolk', 'Common Allergen', true, 'Egg', '🥚'),
('Cow Milk Yogurt', 'Common Allergen', true, 'Dairy', '🥛'),
('Cashew Butter', 'Common Allergen', true, 'Tree Nut', '🌰'),
('Crab', 'Common Allergen', true, 'Shellfish', '🦀'),
('Cod', 'Common Allergen', true, 'Fish', '🐟'),
('Walnut Butter', 'Common Allergen', true, 'Tree Nut', '🌰');

-- =====================
-- END OF MIGRATION
-- =====================
-- 
-- NEXT STEPS:
-- 1. Export additional ref_foods data with image_url, serving_guide, choking_hazard_level from Lovable Cloud
-- 2. Export tip_rules and general_tips data
-- 3. Configure Auth settings (Site URL, Redirect URLs)
-- 4. Set up Edge Function secrets
-- 5. Deploy Edge Functions via Supabase CLI
