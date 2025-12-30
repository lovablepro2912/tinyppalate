import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RefFood, UserFoodState, FoodLog, Profile, FoodStatus, FoodWithState } from '@/types/food';
import { refFoods, initialUserFoodStates, initialLogs, mockProfile } from '@/data/mockFoods';

interface FoodContextType {
  profile: Profile;
  foods: RefFood[];
  userFoodStates: UserFoodState[];
  logs: FoodLog[];
  getFoodWithState: (foodId: number) => FoodWithState;
  getFoodsWithStates: () => FoodWithState[];
  logFood: (foodId: number, hasReaction: boolean, severity?: 0 | 1 | 2, notes?: string) => void;
  getTriedCount: () => number;
  getRecentLogs: (limit: number) => (FoodLog & { food: RefFood })[];
  getNextSuggestions: (limit: number) => RefFood[];
  getAllergenFoods: () => FoodWithState[];
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

// Simple UUID generator for demo
const generateId = () => Math.random().toString(36).substring(2, 15);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [profile] = useState<Profile>(mockProfile);
  const [foods] = useState<RefFood[]>(refFoods);
  const [userFoodStates, setUserFoodStates] = useState<UserFoodState[]>(initialUserFoodStates);
  const [logs, setLogs] = useState<FoodLog[]>(initialLogs);

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

  const logFood = useCallback((foodId: number, hasReaction: boolean, severity: 0 | 1 | 2 = 0, notes: string = '') => {
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

    if (existingState) {
      stateId = existingState.id;
      setUserFoodStates(prev => prev.map(s => 
        s.id === existingState.id
          ? { ...s, status: newStatus, exposure_count: newExposureCount, last_eaten: now }
          : s
      ));
    } else {
      stateId = generateId();
      const newState: UserFoodState = {
        id: stateId,
        user_id: profile.id,
        food_id: foodId,
        status: newStatus,
        exposure_count: newExposureCount,
        last_eaten: now,
      };
      setUserFoodStates(prev => [...prev, newState]);
    }

    const newLog: FoodLog = {
      id: generateId(),
      user_food_state_id: stateId,
      reaction_severity: severity,
      notes,
      photo_url: null,
      created_at: now,
    };
    setLogs(prev => [newLog, ...prev]);
  }, [foods, userFoodStates, profile.id]);

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

  const getNextSuggestions = useCallback((limit: number) => {
    const triedFoodIds = new Set(userFoodStates.map(s => s.food_id));
    return foods
      .filter(f => !f.is_allergen && !triedFoodIds.has(f.id))
      .slice(0, limit);
  }, [foods, userFoodStates]);

  const getAllergenFoods = useCallback(() => {
    return foods
      .filter(f => f.is_allergen)
      .map(food => {
        const state = userFoodStates.find(s => s.food_id === food.id);
        return { ...food, state };
      });
  }, [foods, userFoodStates]);

  return (
    <FoodContext.Provider value={{
      profile,
      foods,
      userFoodStates,
      logs,
      getFoodWithState,
      getFoodsWithStates,
      logFood,
      getTriedCount,
      getRecentLogs,
      getNextSuggestions,
      getAllergenFoods,
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
