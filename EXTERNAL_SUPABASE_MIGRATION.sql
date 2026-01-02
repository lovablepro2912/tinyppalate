-- ============================================
-- TINYPALATE - CONSOLIDATED SUPABASE MIGRATION
-- Run this in your external Supabase SQL Editor
-- ============================================
-- 
-- SCHEMA DESIGN NOTES:
-- - ref_foods: Single source of truth for food definitions
-- - user_food_states: Tracks user's progress with each food
-- - food_logs: Individual log entries with reaction tracking
-- - reaction_severity ENUM: 'none', 'mild', 'moderate', 'severe'
--
-- REMOVED (unused duplicate tables):
-- - foods, food_serving_guidelines, food_exposures
-- ============================================

-- =====================
-- PART 1: ENUMS/TYPES
-- =====================

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

-- ref_foods table (master list of foods - SINGLE SOURCE OF TRUTH)
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

-- user_food_states table (tracks user's progress with each food)
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

-- food_logs table (individual log entries)
-- Uses reaction_severity ENUM for readable values: 'none', 'mild', 'moderate', 'severe'
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_food_state_id UUID NOT NULL REFERENCES public.user_food_states(id) ON DELETE CASCADE,
  reaction_severity public.reaction_severity NOT NULL DEFAULT 'none',
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

-- ref_foods data (master food list)
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

-- tip_rules data
INSERT INTO public.tip_rules (trigger_category, tip_text, action_label, action_food_id) VALUES
('Fruit', 'Great start with fruits! Try introducing some vegetables next to expand variety.', 'Try Carrots', (SELECT id FROM public.ref_foods WHERE name = 'Carrots' LIMIT 1)),
('Common Allergen', 'Introducing allergens early and often can help reduce allergy risk. Keep offering this food regularly.', NULL, NULL),
('Protein', 'Proteins are important for growth! Try different textures as your baby develops.', NULL, NULL);

-- general_tips data
INSERT INTO public.general_tips (category, text) VALUES
('getting_started', 'Start with single-ingredient foods to identify any potential reactions.'),
('allergens', 'Introduce common allergens early (around 6 months) and consistently to reduce allergy risk.'),
('textures', 'Progress from purees to mashed foods, then soft finger foods as your baby develops.'),
('variety', 'Offer a variety of foods from different food groups to ensure balanced nutrition.'),
('patience', 'It can take 10-15 exposures before a baby accepts a new food. Keep trying!');

-- =====================
-- END OF MIGRATION
-- =====================
-- 
-- SUMMARY:
-- ✓ reaction_severity uses ENUM ('none', 'mild', 'moderate', 'severe')
-- ✓ ref_foods is the single source of truth for food definitions
-- ✓ Removed unused tables: foods, food_exposures, food_serving_guidelines
-- ✓ Removed unused enums: food_category, allergen_type, age_range, texture_type
--
-- NEXT STEPS:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. Export full ref_foods data with image_url, serving_guide from Lovable Cloud
-- 3. Configure Auth settings (Site URL, Redirect URLs)
-- 4. Set up Edge Function secrets
-- 5. Deploy Edge Functions via Supabase CLI
