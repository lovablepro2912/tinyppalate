import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFoodContext } from '@/contexts/FoodContext';
import { ACHIEVEMENTS, Achievement, getAchievementById } from '@/data/achievements';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const { userFoodStates, foods, logs } = useFoodContext();
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch unlocked achievements
  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUnlockedAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Unlock an achievement
  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (!user) return;
    
    // Check if already unlocked
    if (unlockedAchievements.some(a => a.achievement_id === achievementId)) {
      return;
    }

    const achievement = getAchievementById(achievementId);
    if (!achievement) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

      if (error) {
        // Likely a duplicate, just ignore
        if (error.code !== '23505') {
          console.error('Error unlocking achievement:', error);
        }
        return;
      }

      // Show celebration
      celebrateAchievement(achievement);
      
      // Refresh achievements list
      await fetchAchievements();
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }, [user, unlockedAchievements, fetchAchievements]);

  // Celebration effect for new achievement
  const celebrateAchievement = (achievement: Achievement) => {
    const colors = {
      common: ['#94a3b8', '#cbd5e1'],
      rare: ['#3b82f6', '#60a5fa'],
      epic: ['#a855f7', '#c084fc'],
      legendary: ['#f59e0b', '#fbbf24', '#ef4444'],
    };

    confetti({
      particleCount: achievement.rarity === 'legendary' ? 150 : 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors[achievement.rarity],
    });

    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-2xl">{achievement.emoji}</span>
        <div>
          <p className="font-bold">Achievement Unlocked!</p>
          <p className="text-sm opacity-80">{achievement.name}</p>
        </div>
      </div>,
      { duration: 4000 }
    );
  };

  // Check and unlock achievements based on current state
  const checkAchievements = useCallback(async () => {
    if (!user || loading) return;

    const triedCount = userFoodStates.filter(s => 
      s.status === 'SAFE' || s.status === 'TRYING'
    ).length;
    const logCount = logs.length;
    
    // Get allergen-related data
    const allergenFoods = foods.filter(f => f.is_allergen);
    const safeAllergens = allergenFoods.filter(af => {
      const state = userFoodStates.find(s => s.food_id === af.id);
      return state?.status === 'SAFE';
    });

    // Group by allergen family
    const familyStatus = new Map<string, { total: number; safe: number }>();
    allergenFoods.forEach(af => {
      const family = af.allergen_family || 'Other';
      if (!familyStatus.has(family)) {
        familyStatus.set(family, { total: 0, safe: 0 });
      }
      const data = familyStatus.get(family)!;
      data.total++;
      const state = userFoodStates.find(s => s.food_id === af.id);
      if (state?.status === 'SAFE') {
        data.safe++;
      }
    });

    // Category counts
    const categoryCounts = new Map<string, number>();
    userFoodStates.forEach(state => {
      if (state.status === 'SAFE' || state.status === 'TRYING') {
        const food = foods.find(f => f.id === state.food_id);
        if (food) {
          const category = food.category.toLowerCase();
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        }
      }
    });

    // Check milestone achievements
    if (triedCount >= 1) await unlockAchievement('first_food');
    if (triedCount >= 10) await unlockAchievement('foods_10');
    if (triedCount >= 25) await unlockAchievement('foods_25');
    if (triedCount >= 50) await unlockAchievement('foods_50');
    if (triedCount >= 75) await unlockAchievement('foods_75');
    if (triedCount >= 100) await unlockAchievement('foods_100');

    // Check log count achievements
    if (logCount >= 10) await unlockAchievement('logs_10');
    if (logCount >= 50) await unlockAchievement('logs_50');
    if (logCount >= 100) await unlockAchievement('logs_100');

    // Check allergen achievements
    if (safeAllergens.length >= 1) await unlockAchievement('first_allergen');

    // Check family completions
    const familyAchievementMap: Record<string, string> = {
      'Dairy': 'dairy_complete',
      'Egg': 'egg_complete',
      'Peanut': 'peanut_complete',
      'Tree Nut': 'tree_nut_complete',
      'Soy': 'soy_complete',
      'Wheat': 'wheat_complete',
      'Fish': 'fish_complete',
      'Shellfish': 'shellfish_complete',
      'Sesame': 'sesame_complete',
    };

    let allFamiliesComplete = true;
    familyStatus.forEach((data, family) => {
      if (data.safe === data.total && data.total > 0) {
        const achievementId = familyAchievementMap[family];
        if (achievementId) {
          unlockAchievement(achievementId);
        }
      } else {
        allFamiliesComplete = false;
      }
    });

    if (allFamiliesComplete && familyStatus.size >= 9) {
      await unlockAchievement('all_allergens');
    }

    // Check category achievements
    if ((categoryCounts.get('fruit') || 0) >= 10) await unlockAchievement('category_fruits');
    if ((categoryCounts.get('vegetable') || 0) >= 10) await unlockAchievement('category_vegetables');
    if ((categoryCounts.get('protein') || 0) >= 10) await unlockAchievement('category_proteins');

  }, [user, loading, userFoodStates, foods, logs, unlockAchievement]);

  // Run achievement check when data changes
  useEffect(() => {
    if (!loading && userFoodStates.length > 0) {
      checkAchievements();
    }
  }, [userFoodStates, logs, loading]);

  const isUnlocked = (achievementId: string) => {
    return unlockedAchievements.some(a => a.achievement_id === achievementId);
  };

  const getUnlockDate = (achievementId: string) => {
    const achievement = unlockedAchievements.find(a => a.achievement_id === achievementId);
    return achievement?.unlocked_at;
  };

  const getUnlockedCount = () => unlockedAchievements.length;
  const getTotalCount = () => ACHIEVEMENTS.length;

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    loading,
    isUnlocked,
    getUnlockDate,
    getUnlockedCount,
    getTotalCount,
    checkAchievements,
    refreshAchievements: fetchAchievements,
  };
}
