import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { AllergenCard } from '@/components/AllergenCard';
import { FoodWithState } from '@/types/food';
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyTabProps {
  onSelectFood: (food: FoodWithState, showSafety: boolean) => void;
}

export function SafetyTab({ onSelectFood }: SafetyTabProps) {
  const { getAllergenFoods } = useFoodContext();
  
  const allergens = getAllergenFoods();
  const safeCount = allergens.filter(f => f.state?.status === 'SAFE').length;
  const tryingCount = allergens.filter(f => f.state?.status === 'TRYING').length;
  const reactionCount = allergens.filter(f => f.state?.status === 'REACTION').length;

  return (
    <div className="pb-24 px-4">
      {/* Header */}
      <motion.div 
        className="pt-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Allergen Protocol</h1>
        </div>
        <p className="text-muted-foreground">
          Safely introduce the Top 9 allergens with our guided protocol
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-success/10 rounded-2xl p-3 text-center">
          <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold text-success">{safeCount}</p>
          <p className="text-xs text-muted-foreground">Safe</p>
        </div>
        <div className="bg-warning/10 rounded-2xl p-3 text-center">
          <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-warning flex items-center justify-center">
            <span className="text-xs font-bold text-warning-foreground">{tryingCount}</span>
          </div>
          <p className="text-2xl font-bold text-warning">{tryingCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-danger/10 rounded-2xl p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-danger mx-auto mb-1" />
          <p className="text-2xl font-bold text-danger">{reactionCount}</p>
          <p className="text-xs text-muted-foreground">Reactions</p>
        </div>
      </motion.div>

      {/* Allergen List */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {allergens.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <AllergenCard 
              food={food}
              onClick={() => onSelectFood(food, !food.state || food.state.status === 'TO_TRY')}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
