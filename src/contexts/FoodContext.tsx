import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { RefFood, UserFoodState, FoodLog, Profile, FoodStatus, FoodWithState } from '@/types/food';
import { toast } from 'sonner';

interface LogUpdate {
  reaction_severity?: 0 | 1 | 2;
  notes?: string;
  created_at?: string;
}

interface ProfileUpdate {
  baby_name?: string;
  birth_date?: string;
}

interface FoodContextType {
  profile: Profile | null;
  foods: RefFood[];
  userFoodStates: UserFoodState[];
  logs: FoodLog[];
  loading: boolean;
  getFoodWithState: (foodId: number) => FoodWithState;
  getFoodsWithStates: () => FoodWithState[];
  logFood: (foodId: number, hasReaction: boolean, severity?: 0 | 1 | 2, notes?: string) => Promise<void>;
  updateLog: (logId: string, updates: LogUpdate) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  getTriedCount: () => number;
  getRecentLogs: (limit: number) => (FoodLog & { food: RefFood })[];
  getNextSuggestions: (limit: number) => RefFood[];
  getAllergenFoods: () => FoodWithState[];
  getAllergenMaintenanceNeeded: () => FoodWithState[];
  refreshData: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

// Helper to cast database response to proper types
function castUserFoodState(data: any): UserFoodState {
  return {
    ...data,
    status: data.status as FoodStatus,
  };
}

function castFoodLog(data: any): FoodLog {
  return {
    ...data,
    reaction_severity: data.reaction_severity as 0 | 1 | 2,
  };
}

export function FoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foods, setFoods] = useState<RefFood[]>([]);
  const [userFoodStates, setUserFoodStates] = useState<UserFoodState[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData as Profile | null);

      // Fetch all foods
      const { data: foodsData } = await supabase
        .from('ref_foods')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      setFoods((foodsData || []) as RefFood[]);

      // Fetch user food states
      const { data: statesData } = await supabase
        .from('user_food_states')
        .select('*')
        .eq('user_id', user.id);
      
      setUserFoodStates((statesData || []).map(castUserFoodState));

      // Fetch logs
      const { data: logsData } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setLogs((logsData || []).map(castFoodLog));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const getFoodWithState = useCallback((foodId: number): FoodWithState => {
    const food = foods.find(f => f.id === foodId)!;
    const state = userFoodStates.find(s => s.food_id === foodId);
    return { ...food, state };
  }, [foods, userFoodStates]);

  const getFoodsWithStates = useCallback((): FoodWithState[] => {
    return foods.map(food => {
      const state = userFoodStates.find(s => s.food_id === food.id);
      return { ...food, state };
    });
  }, [foods, userFoodStates]);

  const logFood = useCallback(async (foodId: number, hasReaction: boolean, severity: 0 | 1 | 2 = 0, notes: string = '') => {
    if (!user) return;

    const food = foods.find(f => f.id === foodId)!;
    const existingState = userFoodStates.find(s => s.food_id === foodId);
    const now = new Date().toISOString();
    
    let newStatus: FoodStatus;
    let newExposureCount: number;
    let stateId: string;

    if (hasReaction) {
      newStatus = 'REACTION';
      newExposureCount = (existingState?.exposure_count || 0) + 1;
    } else if (food.is_allergen) {
      newExposureCount = (existingState?.exposure_count || 0) + 1;
      if (newExposureCount >= 3) {
        newStatus = 'SAFE';
      } else {
        newStatus = 'TRYING';
      }
    } else {
      newStatus = 'SAFE';
      newExposureCount = 1;
    }

    try {
      if (existingState) {
        // Update existing state
        stateId = existingState.id;
        await supabase
          .from('user_food_states')
          .update({
            status: newStatus,
            exposure_count: newExposureCount,
            last_eaten: now,
          })
          .eq('id', existingState.id);
      } else {
        // Create new state
        const { data } = await supabase
          .from('user_food_states')
          .insert({
            user_id: user.id,
            food_id: foodId,
            status: newStatus,
            exposure_count: newExposureCount,
            last_eaten: now,
          })
          .select()
          .single();
        
        stateId = data!.id;
      }

      // Create log
      await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          user_food_state_id: stateId,
          reaction_severity: severity,
          notes,
        });

      // Refresh data
      await refreshData();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error logging food:', error);
      toast.error('Failed to log food. Please try again.');
      throw error;
    }
  }, [foods, userFoodStates, user, refreshData]);

  const updateLog = useCallback(async (logId: string, updates: LogUpdate) => {
    try {
      await supabase
        .from('food_logs')
        .update({
          ...(updates.reaction_severity !== undefined && { reaction_severity: updates.reaction_severity }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          ...(updates.created_at !== undefined && { created_at: updates.created_at }),
        })
        .eq('id', logId);
      
      await refreshData();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating log:', error);
      toast.error('Failed to update log. Please try again.');
      throw error;
    }
  }, [refreshData]);

  const deleteLog = useCallback(async (logId: string) => {
    try {
      await supabase
        .from('food_logs')
        .delete()
        .eq('id', logId);
      
      await refreshData();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting log:', error);
      toast.error('Failed to delete log. Please try again.');
      throw error;
    }
  }, [refreshData]);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      await refreshData();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    }
  }, [user, refreshData]);

  const getTriedCount = useCallback(() => {
    return userFoodStates.filter(s => s.status === 'SAFE' || s.status === 'TRYING').length;
  }, [userFoodStates]);

  const getRecentLogs = useCallback((limit: number) => {
    return logs
      .slice(0, limit)
      .map(log => {
        const state = userFoodStates.find(s => s.id === log.user_food_state_id);
        const food = foods.find(f => f.id === state?.food_id)!;
        return { ...log, food };
      })
      .filter(log => log.food);
  }, [logs, userFoodStates, foods]);

  // Calculate baby's age in months from birth date
  const getAgeInMonths = useCallback((birthDate: string | null | undefined): number => {
    if (!birthDate) return 6; // Default to 6 months if unknown
    const birth = new Date(birthDate);
    const now = new Date();
    return Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  }, []);

  // Get priority score for a food based on baby's age
  const getAgePriorityScore = useCallback((foodName: string, ageMonths: number): number => {
    const nameLower = foodName.toLowerCase();
    
    // Stage 1 (4-6 months) - First foods: soft, mild, easy to digest
    const stage1 = ['avocado', 'banana', 'sweet potato', 'pear', 'carrot', 
                    'pumpkin', 'apple', 'oatmeal', 'rice', 'butternut squash'];
    
    // Stage 2 (6-8 months) - Iron & protein introduction
    const stage2 = ['chicken', 'lentils', 'spinach', 'broccoli', 'peas', 
                    'zucchini', 'peach', 'mango', 'green beans', 'turkey'];
    
    // Stage 3 (8-10 months) - Texture expansion
    const stage3 = ['beef', 'quinoa', 'blueberries', 'strawberries', 'cucumber',
                    'pasta', 'cheese', 'yogurt', 'tofu', 'asparagus'];
    
    const matchesStage = (stageList: string[]) =>
      stageList.some(s => nameLower.includes(s));
    
    if (ageMonths < 6) {
      if (matchesStage(stage1)) return 100;
      return 10; // Not ideal for this age
    } else if (ageMonths < 8) {
      if (matchesStage(stage1)) return 100;
      if (matchesStage(stage2)) return 80;
      return 30;
    } else if (ageMonths < 10) {
      if (matchesStage(stage1)) return 90;
      if (matchesStage(stage2)) return 100;
      if (matchesStage(stage3)) return 80;
      return 50;
    } else {
      // 10+ months - all foods appropriate, encourage variety
      if (matchesStage(stage1)) return 70;
      if (matchesStage(stage2)) return 80;
      if (matchesStage(stage3)) return 90;
      return 100; // Encourage trying new things!
    }
  }, []);

  const getNextSuggestions = useCallback((limit: number) => {
    const triedFoodIds = new Set(userFoodStates.map(s => s.food_id));
    const ageInMonths = getAgeInMonths(profile?.birth_date);
    
    // Get untried non-allergen foods with priority scores
    const scoredFoods = foods
      .filter(f => !f.is_allergen && !triedFoodIds.has(f.id))
      .map(food => ({
        food,
        score: getAgePriorityScore(food.name, ageInMonths)
      }))
      .sort((a, b) => b.score - a.score);
    
    return scoredFoods.slice(0, limit).map(s => s.food);
  }, [foods, userFoodStates, profile, getAgeInMonths, getAgePriorityScore]);

  const getAllergenFoods = useCallback(() => {
    return foods
      .filter(f => f.is_allergen)
      .map(food => {
        const state = userFoodStates.find(s => s.food_id === food.id);
        return { ...food, state };
      });
  }, [foods, userFoodStates]);

  const getAllergenMaintenanceNeeded = useCallback(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return foods
      .filter(f => f.is_allergen)
      .map(food => {
        const state = userFoodStates.find(s => s.food_id === food.id);
        return { ...food, state };
      })
      .filter(food => {
        if (!food.state || food.state.status !== 'SAFE') return false;
        if (!food.state.last_eaten) return true;
        const lastEaten = new Date(food.state.last_eaten);
        return lastEaten < sevenDaysAgo;
      });
  }, [foods, userFoodStates]);

  return (
    <FoodContext.Provider value={{
      profile,
      foods,
      userFoodStates,
      logs,
      loading,
      getFoodWithState,
      getFoodsWithStates,
      logFood,
      updateLog,
      deleteLog,
      updateProfile,
      getTriedCount,
      getRecentLogs,
      getNextSuggestions,
      getAllergenFoods,
      getAllergenMaintenanceNeeded,
      refreshData,
    }}>
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodContext() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFoodContext must be used within a FoodProvider');
  }
  return context;
}
