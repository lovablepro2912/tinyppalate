import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { ProgressRing } from '@/components/ProgressRing';
import { FoodCard } from '@/components/FoodCard';
import { ChevronRight, Sparkles, Clock } from 'lucide-react';
import { FoodWithState } from '@/types/food';
import { formatDistanceToNow } from 'date-fns';

interface HomeTabProps {
  onSelectFood: (food: FoodWithState) => void;
}

export function HomeTab({ onSelectFood }: HomeTabProps) {
  const { profile, getTriedCount, getNextSuggestions, getRecentLogs, getFoodWithState } = useFoodContext();
  
  const triedCount = getTriedCount();
  const suggestions = getNextSuggestions(4);
  const recentLogs = getRecentLogs(3);

  return (
    <div className="pb-24 px-4 space-y-6">
      {/* Header */}
      <motion.div 
        className="pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Hi, {profile.baby_name}! 👋
        </h1>
        <p className="text-muted-foreground">Let's explore new tastes today</p>
      </motion.div>

      {/* Progress Card */}
      <motion.div 
        className="bg-card rounded-3xl p-6 card-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col items-center">
          <ProgressRing progress={triedCount} total={100} />
          <p className="mt-4 text-center text-muted-foreground font-medium">
            {100 - triedCount} more foods to discover!
          </p>
        </div>
      </motion.div>

      {/* Next Up Suggestions */}
      {suggestions.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Try Next</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {suggestions.map(food => (
              <FoodCard 
                key={food.id} 
                food={getFoodWithState(food.id)}
                onClick={() => onSelectFood(getFoodWithState(food.id))}
                showStatus={false}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Recent</h2>
            </div>
          </div>
          <div className="space-y-2">
            {recentLogs.map(log => (
              <motion.div
                key={log.id}
                className="flex items-center gap-3 bg-card rounded-2xl p-3 card-shadow"
                whileHover={{ x: 4 }}
              >
                <span className="text-2xl">{log.food.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{log.food.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
                {log.reaction_severity === 0 && (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                    Safe
                  </span>
                )}
                {log.reaction_severity > 0 && (
                  <span className="text-xs font-medium text-danger bg-danger/10 px-2 py-1 rounded-full">
                    Reaction
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
