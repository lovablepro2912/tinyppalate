import { RefFood, UserFoodState, FoodLog, Profile } from '@/types/food';

export const mockProfile: Profile = {
  id: 'user-1',
  baby_name: 'Emma',
  birth_date: '2024-06-15',
  allergies: [],
};

export const refFoods: RefFood[] = [
  // Fruits
  { id: 1, name: 'Avocado', category: 'Fruit', is_allergen: false, allergen_family: null, emoji: '🥑' },
  { id: 2, name: 'Banana', category: 'Fruit', is_allergen: false, allergen_family: null, emoji: '🍌' },
  { id: 3, name: 'Apple', category: 'Fruit', is_allergen: false, allergen_family: null, emoji: '🍎' },
  { id: 4, name: 'Mango', category: 'Fruit', is_allergen: false, allergen_family: null, emoji: '🥭' },
  { id: 5, name: 'Blueberries', category: 'Fruit', is_allergen: false, allergen_family: null, emoji: '🫐' },
  
  // Vegetables
  { id: 6, name: 'Sweet Potato', category: 'Vegetable', is_allergen: false, allergen_family: null, emoji: '🍠' },
  { id: 7, name: 'Carrots', category: 'Vegetable', is_allergen: false, allergen_family: null, emoji: '🥕' },
  { id: 8, name: 'Broccoli', category: 'Vegetable', is_allergen: false, allergen_family: null, emoji: '🥦' },
  { id: 9, name: 'Peas', category: 'Vegetable', is_allergen: false, allergen_family: null, emoji: '🟢' },
  { id: 10, name: 'Spinach', category: 'Vegetable', is_allergen: false, allergen_family: null, emoji: '🥬' },
  
  // Proteins
  { id: 11, name: 'Chicken', category: 'Protein', is_allergen: false, allergen_family: null, emoji: '🍗' },
  { id: 12, name: 'Beef', category: 'Protein', is_allergen: false, allergen_family: null, emoji: '🥩' },
  { id: 13, name: 'Turkey', category: 'Protein', is_allergen: false, allergen_family: null, emoji: '🦃' },
  { id: 14, name: 'Tofu', category: 'Protein', is_allergen: false, allergen_family: null, emoji: '🧈' },
  { id: 15, name: 'Lentils', category: 'Protein', is_allergen: false, allergen_family: null, emoji: '🫘' },
  
  // Grains
  { id: 16, name: 'Oatmeal', category: 'Grain', is_allergen: false, allergen_family: null, emoji: '🥣' },
  { id: 17, name: 'Rice', category: 'Grain', is_allergen: false, allergen_family: null, emoji: '🍚' },
  { id: 18, name: 'Quinoa', category: 'Grain', is_allergen: false, allergen_family: null, emoji: '🌾' },
  
  // Top 9 Allergens
  { id: 19, name: 'Peanut Butter', category: 'Common Allergen', is_allergen: true, allergen_family: 'Peanut', emoji: '🥜' },
  { id: 20, name: 'Scrambled Egg', category: 'Common Allergen', is_allergen: true, allergen_family: 'Egg', emoji: '🥚' },
  { id: 21, name: 'Whole Milk', category: 'Common Allergen', is_allergen: true, allergen_family: 'Dairy', emoji: '🥛' },
  { id: 22, name: 'Soy Milk', category: 'Common Allergen', is_allergen: true, allergen_family: 'Soy', emoji: '🫛' },
  { id: 23, name: 'Wheat Bread', category: 'Common Allergen', is_allergen: true, allergen_family: 'Wheat', emoji: '🍞' },
  { id: 24, name: 'Salmon', category: 'Common Allergen', is_allergen: true, allergen_family: 'Fish', emoji: '🐟' },
  { id: 25, name: 'Shrimp', category: 'Common Allergen', is_allergen: true, allergen_family: 'Shellfish', emoji: '🦐' },
  { id: 26, name: 'Sesame Tahini', category: 'Common Allergen', is_allergen: true, allergen_family: 'Sesame', emoji: '🫓' },
  { id: 27, name: 'Almond Butter', category: 'Common Allergen', is_allergen: true, allergen_family: 'Tree Nut', emoji: '🌰' },
];

export const initialUserFoodStates: UserFoodState[] = [
  { id: 'state-1', user_id: 'user-1', food_id: 1, status: 'SAFE', exposure_count: 1, last_eaten: '2024-12-28T10:00:00Z' },
  { id: 'state-2', user_id: 'user-1', food_id: 2, status: 'SAFE', exposure_count: 1, last_eaten: '2024-12-27T12:00:00Z' },
  { id: 'state-3', user_id: 'user-1', food_id: 6, status: 'SAFE', exposure_count: 1, last_eaten: '2024-12-26T11:00:00Z' },
  { id: 'state-4', user_id: 'user-1', food_id: 7, status: 'SAFE', exposure_count: 1, last_eaten: '2024-12-25T09:00:00Z' },
  { id: 'state-5', user_id: 'user-1', food_id: 20, status: 'TRYING', exposure_count: 2, last_eaten: '2024-12-29T08:00:00Z' },
  { id: 'state-6', user_id: 'user-1', food_id: 21, status: 'SAFE', exposure_count: 3, last_eaten: '2024-12-24T10:00:00Z' },
];

export const initialLogs: FoodLog[] = [
  { id: 'log-1', user_food_state_id: 'state-5', reaction_severity: 0, notes: 'Loved it!', photo_url: null, created_at: '2024-12-29T08:00:00Z' },
  { id: 'log-2', user_food_state_id: 'state-1', reaction_severity: 0, notes: 'First time trying', photo_url: null, created_at: '2024-12-28T10:00:00Z' },
  { id: 'log-3', user_food_state_id: 'state-2', reaction_severity: 0, notes: '', photo_url: null, created_at: '2024-12-27T12:00:00Z' },
];

export const categories = ['Fruit', 'Vegetable', 'Protein', 'Grain', 'Common Allergen'];
