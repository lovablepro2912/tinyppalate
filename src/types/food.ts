export type FoodStatus = 'TO_TRY' | 'TRYING' | 'SAFE' | 'REACTION';

export interface RefFood {
  id: number;
  name: string;
  category: string;
  is_allergen: boolean;
  allergen_family: string | null;
  emoji: string;
}

export interface UserFoodState {
  id: string;
  user_id: string;
  food_id: number;
  status: FoodStatus;
  exposure_count: number;
  last_eaten: string | null;
}

export interface FoodLog {
  id: string;
  user_food_state_id: string;
  reaction_severity: 0 | 1 | 2;
  notes: string;
  photo_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  baby_name: string;
  birth_date: string;
  allergies: string[];
}

export interface FoodWithState extends RefFood {
  state?: UserFoodState;
}
