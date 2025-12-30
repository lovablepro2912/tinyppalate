-- Create profiles table for baby information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_name TEXT NOT NULL DEFAULT 'Baby',
  birth_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create ref_foods table (master list of foods)
CREATE TABLE public.ref_foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_allergen BOOLEAN NOT NULL DEFAULT false,
  allergen_family TEXT,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access
ALTER TABLE public.ref_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view foods"
  ON public.ref_foods FOR SELECT
  USING (true);

-- Create user_food_states table
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

-- Enable RLS on user_food_states
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

-- Create food_logs table
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_food_state_id UUID NOT NULL REFERENCES public.user_food_states(id) ON DELETE CASCADE,
  reaction_severity SMALLINT NOT NULL DEFAULT 0 CHECK (reaction_severity IN (0, 1, 2)),
  notes TEXT DEFAULT '',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on food_logs
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_food_states_updated_at
  BEFORE UPDATE ON public.user_food_states
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the ref_foods table with initial foods
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