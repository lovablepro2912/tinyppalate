import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Salad, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFoodContext } from '@/contexts/FoodContext';
import { Button } from '@/components/ui/button';
import { FoodWithState } from '@/types/food';

const DAILY_BITE_CACHE_KEY = 'daily-bite-cache';

interface DailyBiteCache {
  date: string;
  tipText: string;
  tipType: 'general' | 'nutrition' | 'skill';
  actionFoodId: number | null;
  actionLabel: string | null;
}

interface TipRule {
  id: string;
  trigger_category: string;
  tip_text: string;
  action_label: string | null;
  action_food_id: number | null;
}

interface GeneralTip {
  id: string;
  category: string;
  text: string;
}

interface DailyBiteWidgetProps {
  onSelectFood: (food: FoodWithState) => void;
}

export function DailyBiteWidget({ onSelectFood }: DailyBiteWidgetProps) {
  const { getRecentLogs, getFoodWithState, foods } = useFoodContext();
  const [tipText, setTipText] = useState<string | null>(null);
  const [tipType, setTipType] = useState<'general' | 'nutrition' | 'skill'>('general');
  const [actionFood, setActionFood] = useState<FoodWithState | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Only load once per mount, and only when foods are available
    if (hasLoaded.current || foods.length === 0) return;
    hasLoaded.current = true;
    loadSmartTip();
  }, [foods]);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const loadFromCache = (): DailyBiteCache | null => {
    try {
      const cached = localStorage.getItem(DAILY_BITE_CACHE_KEY);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached) as DailyBiteCache;
      const today = getTodayDateString();
      
      // Only use cache if it's from today
      if (cacheData.date === today && cacheData.tipText) {
        return cacheData;
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveToCache = (data: Omit<DailyBiteCache, 'date'>) => {
    try {
      const cacheData: DailyBiteCache = {
        ...data,
        date: getTodayDateString()
      };
      localStorage.setItem(DAILY_BITE_CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  };

  const loadSmartTip = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cached = loadFromCache();
      if (cached) {
        setTipText(cached.tipText);
        setTipType(cached.tipType);
        setActionLabel(cached.actionLabel);
        
        if (cached.actionFoodId) {
          const food = getFoodWithState(cached.actionFoodId);
          if (food) {
            setActionFood(food);
          }
        }
        setLoading(false);
        return;
      }
      
      // No valid cache, fetch new tip
      const recentLogs = getRecentLogs(1);
      
      if (recentLogs.length > 0) {
        const mostRecentFood = recentLogs[0].food;
        
        // Check if there's a tip rule matching this food's category
        const { data: tipRules } = await supabase
          .from('tip_rules')
          .select('*')
          .eq('trigger_category', mostRecentFood.category);
        
        if (tipRules && tipRules.length > 0) {
          const rule = tipRules[0] as TipRule;
          const newTipType = rule.action_food_id ? 'nutrition' : 'skill';
          
          setTipText(rule.tip_text);
          setTipType(newTipType);
          setActionLabel(rule.action_label);
          
          if (rule.action_food_id) {
            const food = getFoodWithState(rule.action_food_id);
            if (food) {
              setActionFood(food);
            }
          }
          
          // Save to cache
          saveToCache({
            tipText: rule.tip_text,
            tipType: newTipType,
            actionFoodId: rule.action_food_id,
            actionLabel: rule.action_label
          });
          
          setLoading(false);
          return;
        }
      }
      
      // Fallback to random general tip
      const { data: generalTips } = await supabase
        .from('general_tips')
        .select('*');
      
      if (generalTips && generalTips.length > 0) {
        const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)] as GeneralTip;
        setTipText(randomTip.text);
        setTipType('general');
        setActionFood(null);
        setActionLabel(null);
        
        // Save to cache
        saveToCache({
          tipText: randomTip.text,
          tipType: 'general',
          actionFoodId: null,
          actionLabel: null
        });
      }
    } catch (error) {
      console.error('Error loading smart tip:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (tipType) {
      case 'nutrition':
        return <Salad className="w-5 h-5 text-success" />;
      case 'skill':
        return <GraduationCap className="w-5 h-5 text-primary" />;
      default:
        return <Lightbulb className="w-5 h-5 text-warning" />;
    }
  };

  if (loading || !tipText) {
    return null;
  }

  return (
    <motion.div
      className="bg-info/10 border border-info/20 rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm mb-1">Daily Bite</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tipText}
          </p>
          {actionFood && actionLabel && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 text-xs"
              onClick={() => onSelectFood(actionFood)}
            >
              {actionFood.emoji} {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
