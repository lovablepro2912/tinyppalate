import { Tables } from '@/integrations/supabase/types';

export type FoodStatus = 'TO_TRY' | 'TRYING' | 'SAFE' | 'REACTION';

// Database types with proper casting
export type RefFood = Tables<'ref_foods'>;

export interface UserFoodState {
  id: string;
  user_id: string;
  food_id: number;
  status: FoodStatus;
  exposure_count: number;
  last_eaten: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  user_food_state_id: string;
  reaction_severity: 0 | 1 | 2;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  baby_name: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodWithState extends RefFood {
  state?: UserFoodState;
}
