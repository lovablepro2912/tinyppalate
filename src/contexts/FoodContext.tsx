import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { RefFood, UserFoodState, FoodLog, Profile, FoodStatus, FoodWithState } from '@/types/food';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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
  getSafeAllergenCount: () => number;
  getTotalAllergenCount: () => number;
  getTotalLogCount: () => number;
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

// Celebration functions
const triggerFoodSafeCelebration = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#22c55e', '#86efac', '#4ade80'],
  });
};

const triggerGroupCompleteCelebration = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#22c55e', '#f59e0b', '#3b82f6'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#22c55e', '#f59e0b', '#3b82f6'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

const triggerAllCompleteCelebration = () => {
  const epicDuration = 4000;
  const epicEnd = Date.now() + epicDuration;
  
  confetti({
    particleCount: 150,
    spread: 180,
    origin: { y: 0.5 },
    colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
  });

  const epicFrame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.5 },
      colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.5 },
      colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
    });

    if (Date.now() < epicEnd) {
      requestAnimationFrame(epicFrame);
    }
  };
  epicFrame();

  setTimeout(() => {
    confetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#22c55e', '#f59e0b', '#3b82f6'],
    });
  }, 500);
  setTimeout(() => {
    confetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      origin: { x: 0.3, y: 0.4 },
      colors: ['#ec4899', '#8b5cf6', '#22c55e'],
    });
  }, 1000);
};

const triggerMilestoneCelebration = () => {
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
  });
};

export function FoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foods, setFoods] = useState<RefFood[]>([]);
  const [userFoodStates, setUserFoodStates] = useState<UserFoodState[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const previousSafeAllergenFamiliesRef = useRef<Set<string>>(new Set());

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
      
      const allFoods = (foodsData || []) as RefFood[];
      setFoods(allFoods);

      // Fetch user food states
      const { data: statesData } = await supabase
        .from('user_food_states')
        .select('*')
        .eq('user_id', user.id);
      
      const allStates = (statesData || []).map(castUserFoodState);
      setUserFoodStates(allStates);
      
      // Initialize the safe allergen families ref
      const allergenFoods = allFoods.filter(f => f.is_allergen);
      const familyStatus = new Map<string, { total: number; safe: number }>();
      
      allergenFoods.forEach(af => {
        const family = af.allergen_family || 'Other';
        if (!familyStatus.has(family)) {
          familyStatus.set(family, { total: 0, safe: 0 });
        }
        const data = familyStatus.get(family)!;
        data.total++;
        
        const state = allStates.find(s => s.food_id === af.id);
        if (state?.status === 'SAFE') {
          data.safe++;
        }
      });
      
      const completeFamilies = new Set<string>();
      familyStatus.forEach((data, family) => {
        if (data.safe === data.total && data.total > 0) {
          completeFamilies.add(family);
        }
      });
      previousSafeAllergenFamiliesRef.current = completeFamilies;

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
    const tempLogId = `temp-${Date.now()}`;
    const tempStateId = existingState?.id || `temp-state-${Date.now()}`;

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

    // OPTIMISTIC UPDATE: Update local state immediately
    const optimisticState: UserFoodState = existingState 
      ? { ...existingState, status: newStatus, exposure_count: newExposureCount, last_eaten: now }
      : {
          id: tempStateId,
          user_id: user.id,
          food_id: foodId,
          status: newStatus,
          exposure_count: newExposureCount,
          last_eaten: now,
          created_at: now,
          updated_at: now,
        };

    const optimisticLog: FoodLog = {
      id: tempLogId,
      user_id: user.id,
      user_food_state_id: tempStateId,
      reaction_severity: severity,
      notes,
      photo_url: null,
      created_at: now,
    };

    // Update states optimistically
    if (existingState) {
      setUserFoodStates(prev => prev.map(s => s.id === existingState.id ? optimisticState : s));
    } else {
      setUserFoodStates(prev => [...prev, optimisticState]);
    }
    setLogs(prev => [optimisticLog, ...prev]);

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
        
        // Update the temp state ID with real ID
        setUserFoodStates(prev => prev.map(s => s.id === tempStateId ? { ...s, id: stateId } : s));
      }

      // Create log
      const { data: logData } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          user_food_state_id: stateId,
          reaction_severity: severity,
          notes,
        })
        .select()
        .single();

      // Update the temp log with real data
      if (logData) {
        setLogs(prev => prev.map(l => l.id === tempLogId ? castFoodLog({ ...logData, user_food_state_id: stateId }) : l));
      }

      // Check for milestones and send notification
      const newTriedCount = userFoodStates.filter(s => s.status === 'SAFE' || s.status === 'TRYING').length + (existingState ? 0 : 1);
      const milestones = [10, 25, 50, 75, 100];
      if (milestones.includes(newTriedCount)) {
        triggerMilestoneCelebration();
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              user_id: user.id,
              title: 'Milestone Achieved! 🎉',
              body: `${profile?.baby_name || 'Your baby'} has tried ${newTriedCount} different foods!`,
              notification_type: 'milestone',
              reference_id: String(newTriedCount)
            }
          });
        } catch (e) {
          console.log('Milestone notification failed:', e);
        }
      }

      // Celebration logic for allergens
      if (newStatus === 'SAFE' && food.is_allergen) {
        // Get allergen families and their completion status BEFORE this log
        const allergenFoods = foods.filter(f => f.is_allergen);
        const allergenFamilies = new Map<string, { total: number; safe: number }>();
        
        allergenFoods.forEach(af => {
          const family = af.allergen_family || 'Other';
          if (!allergenFamilies.has(family)) {
            allergenFamilies.set(family, { total: 0, safe: 0 });
          }
          const familyData = allergenFamilies.get(family)!;
          familyData.total++;
          
          const state = userFoodStates.find(s => s.food_id === af.id);
          if (state?.status === 'SAFE') {
            familyData.safe++;
          }
        });
        
        // Count safe before this action
        const currentFamily = food.allergen_family || 'Other';
        const familyData = allergenFamilies.get(currentFamily);
        const wasAlreadySafe = existingState?.status === 'SAFE';
        
        // If this food wasn't already safe, increment the safe count
        if (familyData && !wasAlreadySafe) {
          familyData.safe++;
        }
        
        // Check if this completes the family
        const familyNowComplete = familyData && familyData.safe === familyData.total;
        const familyWasComplete = previousSafeAllergenFamiliesRef.current.has(currentFamily);
        
        // Check if ALL allergens are now complete
        let allFamiliesComplete = true;
        allergenFamilies.forEach((data) => {
          if (data.safe < data.total) {
            allFamiliesComplete = false;
          }
        });
        
        if (allFamiliesComplete && !wasAlreadySafe) {
          // All allergens complete - EPIC celebration!
          setTimeout(() => {
            triggerAllCompleteCelebration();
            toast.success("🎉 AMAZING! All allergens completed!", {
              description: `${profile?.baby_name || 'Your baby'} has successfully cleared all Top 9 allergens!`,
              duration: 6000,
            });
          }, 300);
        } else if (familyNowComplete && !familyWasComplete && !wasAlreadySafe) {
          // Family just completed - medium celebration
          setTimeout(() => {
            triggerGroupCompleteCelebration();
            toast.success(`🎊 ${currentFamily} group complete!`, {
              description: `All ${currentFamily.toLowerCase()} allergens have been cleared!`,
              duration: 4000,
            });
          }, 300);
        } else if (!wasAlreadySafe) {
          // Individual food marked safe - small celebration
          setTimeout(() => {
            triggerFoodSafeCelebration();
          }, 300);
        }
        
        // Update the ref for next time
        if (familyNowComplete) {
          previousSafeAllergenFamiliesRef.current.add(currentFamily);
        }
      } else if (newStatus === 'SAFE' && !food.is_allergen) {
        // Non-allergen food marked safe - small celebration
        const wasAlreadySafe = existingState?.status === 'SAFE';
        if (!wasAlreadySafe) {
          setTimeout(() => {
            triggerFoodSafeCelebration();
          }, 300);
        }
      }
    } catch (error) {
      // Rollback optimistic updates on error
      if (existingState) {
        setUserFoodStates(prev => prev.map(s => s.id === existingState.id ? existingState : s));
      } else {
        setUserFoodStates(prev => prev.filter(s => s.id !== tempStateId));
      }
      setLogs(prev => prev.filter(l => l.id !== tempLogId));
      
      if (import.meta.env.DEV) console.error('Error logging food:', error);
      toast.error('Failed to log food. Please try again.');
      throw error;
    }
  }, [foods, userFoodStates, user, profile]);

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

  const getSafeAllergenCount = useCallback(() => {
    const allergenIds = new Set(foods.filter(f => f.is_allergen).map(f => f.id));
    return userFoodStates.filter(s => allergenIds.has(s.food_id) && s.status === 'SAFE').length;
  }, [foods, userFoodStates]);

  const getTotalAllergenCount = useCallback(() => {
    return foods.filter(f => f.is_allergen).length;
  }, [foods]);

  const getTotalLogCount = useCallback(() => {
    return logs.length;
  }, [logs]);

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
      getSafeAllergenCount,
      getTotalAllergenCount,
      getTotalLogCount,
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
