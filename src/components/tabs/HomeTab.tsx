import { useState } from "react";
import { motion } from "framer-motion";
import { useFoodContext } from "@/contexts/FoodContext";
import { ProgressRing } from "@/components/ProgressRing";
import { FoodCard } from "@/components/FoodCard";
import { FoodDetailSheet } from "@/components/FoodDetailSheet";
import { DailyBiteWidget } from "@/components/DailyBiteWidget";
import { EditLogModal } from "@/components/EditLogModal";
import { Sparkles, Clock, ShieldCheck, CalendarClock, UtensilsCrossed, ShieldPlus, BookOpen } from "lucide-react";
import { FoodWithState, FoodLog, RefFood } from "@/types/food";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface HomeTabProps {
  onSelectFood: (food: FoodWithState) => void;
}

export function HomeTab({ onSelectFood }: HomeTabProps) {
  const {
    profile,
    getTriedCount,
    getNextSuggestions,
    getRecentLogs,
    getFoodWithState,
    getAllergenMaintenanceNeeded,
    getSafeAllergenCount,
    getTotalAllergenCount,
    getTotalLogCount,
  } = useFoodContext();

  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodWithState | null>(null);
  const [selectedLog, setSelectedLog] = useState<(FoodLog & { food: RefFood }) | null>(null);

  const triedCount = getTriedCount();
  const suggestions = getNextSuggestions(4);
  const recentLogs = getRecentLogs(3);
  const maintenanceNeeded = getAllergenMaintenanceNeeded();
  const safeAllergenCount = getSafeAllergenCount();
  const totalAllergenCount = getTotalAllergenCount();
  const totalLogs = getTotalLogCount();

  const handleFoodClick = (food: FoodWithState) => {
    setSelectedFoodForDetail(food);
  };

  const handleCloseDetail = () => {
    setSelectedFoodForDetail(null);
  };

  const handleLogFromDetail = (food: FoodWithState) => {
    setSelectedFoodForDetail(null);
    onSelectFood(food);
  };

  return (
    <div className="pb-24 px-4 space-y-6">
      {/* Header */}
      <motion.div className="pt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Hi, {profile?.baby_name || "Baby"}!</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-3 text-center">
              <UtensilsCrossed className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{triedCount}</p>
              <p className="text-xs text-muted-foreground">Foods Tried</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-3 text-center">
              <ShieldPlus className="w-5 h-5 mx-auto mb-1 text-success" />
              <p className="text-xl font-bold text-foreground">
                {safeAllergenCount}/{totalAllergenCount}
              </p>
              <p className="text-xs text-muted-foreground">Allergens Safe</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-3 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-info" />
              <p className="text-xl font-bold text-foreground">{totalLogs}</p>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Next Up Suggestions */}
      {suggestions.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Try Next</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {suggestions.map((food) => (
              <FoodCard
                key={food.id}
                food={getFoodWithState(food.id)}
                onClick={() => handleFoodClick(getFoodWithState(food.id))}
                showStatus={false}
                forceColor={true}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Daily Bite Widget */}
      <DailyBiteWidget onSelectFood={handleLogFromDetail} />

      {/* Food Detail Sheet */}
      <FoodDetailSheet food={selectedFoodForDetail} onClose={handleCloseDetail} onLogFood={handleLogFromDetail} />
      
      {/* Edit Log Modal */}
      <EditLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />

      {/* Allergen Maintenance Section */}
      {maintenanceNeeded.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Allergen Maintenance</h2>
          </div>
          <div className="space-y-2">
            {maintenanceNeeded.map((food) => {
              const daysSince = food.state?.last_eaten
                ? differenceInDays(new Date(), new Date(food.state.last_eaten))
                : null;
              return (
                <motion.button
                  key={food.id}
                  onClick={() => onSelectFood(food)}
                  className="w-full flex items-center gap-3 bg-info/10 border border-info/30 rounded-2xl p-3 hover:bg-info/20 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-foreground truncate">{food.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {daysSince !== null ? `Last eaten ${daysSince} days ago` : "Never eaten"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-info bg-info/20 px-2 py-1 rounded-full whitespace-nowrap">
                    Immunity Maintenance
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Recent</h2>
            </div>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const hasReaction = log.reaction_severity > 0;
              const foodState = getFoodWithState(log.food.id);
              const isAllergenInProgress =
                log.food.is_allergen &&
                foodState.state?.status !== "REACTION" &&
                (foodState.state?.exposure_count || 0) < 3;

              const getStatusBadge = () => {
                if (hasReaction) {
                  return (
                    <span className="text-xs font-medium text-danger bg-danger/20 px-2 py-1 rounded-full">
                      {log.reaction_severity === 2 ? "Severe" : "Mild"}
                    </span>
                  );
                }
                if (isAllergenInProgress) {
                  return (
                    <span className="text-xs font-medium text-warning bg-warning/20 px-2 py-1 rounded-full">
                      Exposure {foodState.state?.exposure_count || 0}/3
                    </span>
                  );
                }
                return (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">Safe</span>
                );
              };

              return (
                <motion.button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-2xl p-3 card-shadow text-left",
                    hasReaction ? "bg-danger/10 border border-danger/20" : "bg-card",
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{log.food.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{log.food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusBadge()}
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}
