import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAchievements } from '@/hooks/useAchievements';
import { Achievement, getRarityColor, getRarityBorder } from '@/data/achievements';
import { Trophy, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AchievementsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementsSheet({ open, onOpenChange }: AchievementsSheetProps) {
  const { achievements, isUnlocked, getUnlockDate, getUnlockedCount, getTotalCount } = useAchievements();

  const categories = [
    { id: 'milestone', label: 'Milestones', emoji: '🎯' },
    { id: 'allergen', label: 'Allergens', emoji: '🛡️' },
    { id: 'streak', label: 'Streaks', emoji: '🔥' },
    { id: 'special', label: 'Special', emoji: '⭐' },
  ];

  const groupedAchievements = categories.map(cat => ({
    ...cat,
    achievements: achievements.filter(a => a.category === cat.id),
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Achievements</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {getUnlockedCount()} / {getTotalCount()}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(85vh-100px)] pr-4">
          <div className="space-y-6 pb-8">
            {groupedAchievements.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                  <span>{group.emoji}</span>
                  <span>{group.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({group.achievements.filter(a => isUnlocked(a.id)).length}/{group.achievements.length})
                  </span>
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {group.achievements.map((achievement, index) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={isUnlocked(achievement.id)}
                      unlockDate={getUnlockDate(achievement.id)}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockDate?: string;
  delay: number;
}

function AchievementCard({ achievement, unlocked, unlockDate, delay }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={cn(
        "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all",
        unlocked 
          ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} bg-opacity-10 ${getRarityBorder(achievement.rarity)}` 
          : "bg-muted/30 border-muted-foreground/20 opacity-60"
      )}
    >
      {!unlocked && (
        <div className="absolute top-1 right-1">
          <Lock className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
      
      <div className={cn(
        "text-2xl mb-1",
        !unlocked && "grayscale opacity-50"
      )}>
        {achievement.emoji}
      </div>
      
      <p className={cn(
        "text-[10px] font-medium text-center leading-tight",
        unlocked ? "text-foreground" : "text-muted-foreground"
      )}>
        {achievement.name}
      </p>
      
      {unlocked && unlockDate && (
        <p className="text-[8px] text-muted-foreground mt-1">
          {format(new Date(unlockDate), 'MMM d')}
        </p>
      )}
    </motion.div>
  );
}
