import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { ProgressRing } from '@/components/ProgressRing';
import { FoodCard } from '@/components/FoodCard';
import { Sparkles, Clock, ShieldCheck, CalendarClock } from 'lucide-react';
import { FoodWithState } from '@/types/food';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface HomeTabProps {
  onSelectFood: (food: FoodWithState) => void;
}

export function HomeTab({ onSelectFood }: HomeTabProps) {
  const { profile, getTriedCount, getNextSuggestions, getRecentLogs, getFoodWithState, getAllergenMaintenanceNeeded } = useFoodContext();
  
  const triedCount = getTriedCount();
  const suggestions = getNextSuggestions(4);
  const recentLogs = getRecentLogs(3);
  const maintenanceNeeded = getAllergenMaintenanceNeeded();

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
                forceColor={true}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Allergen Maintenance Section */}
      {maintenanceNeeded.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Allergen Maintenance</h2>
          </div>
          <div className="space-y-2">
            {maintenanceNeeded.map(food => {
              const daysSince = food.state?.last_eaten 
                ? differenceInDays(new Date(), new Date(food.state.last_eaten))
                : null;
              return (
                <motion.button
                  key={food.id}
                  onClick={() => onSelectFood(food)}
                  className="w-full flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-2xl p-3 hover:bg-warning/20 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-foreground truncate">{food.name}</p>
                    <p className="text-xs text-warning-foreground flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {daysSince !== null ? `Last eaten ${daysSince} days ago` : 'Never eaten'}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-warning bg-warning/20 px-2 py-1 rounded-full whitespace-nowrap">
                    Time to sustain!
                  </span>
                </motion.button>
              );
            })}
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
            {recentLogs.map(log => {
              const hasReaction = log.reaction_severity > 0;
              return (
                <motion.div
                  key={log.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3 card-shadow",
                    hasReaction 
                      ? "bg-danger/10 border border-danger/20" 
                      : "bg-card"
                  )}
                  whileHover={{ x: 4 }}
                >
                  <span className="text-2xl">{log.food.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{log.food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!hasReaction && (
                    <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                      Safe
                    </span>
                  )}
                  {hasReaction && (
                    <span className="text-xs font-medium text-danger bg-danger/20 px-2 py-1 rounded-full">
                      {log.reaction_severity === 2 ? 'Severe' : 'Mild'}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}