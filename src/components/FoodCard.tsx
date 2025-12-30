import { motion } from 'framer-motion';
import { FoodWithState } from '@/types/food';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodCardProps {
  food: FoodWithState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  forceColor?: boolean; // New prop to force full color (for Try Next section)
}

export function FoodCard({ food, onClick, size = 'md', showStatus = true, forceColor = false }: FoodCardProps) {
  const isUnlocked = food.state && (food.state.status === 'SAFE' || food.state.status === 'TRYING');
  const hasReaction = food.state?.status === 'REACTION';

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const emojiSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  // Only apply grayscale if not unlocked, not a reaction, and not forced to color
  const shouldBeGrayscale = !forceColor && !isUnlocked && !hasReaction;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all",
        "bg-card card-shadow border border-border/50",
        "hover:scale-105 active:scale-95",
        hasReaction && "ring-2 ring-danger/50 bg-danger/5"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={cn(
        sizeClasses[size],
        "flex items-center justify-center rounded-xl bg-secondary/50",
        shouldBeGrayscale && "grayscale-food"
      )}>
        <span className={emojiSizes[size]}>{food.emoji}</span>
      </div>
      
      <span className="text-xs font-medium text-foreground text-center line-clamp-1 max-w-full px-1">
        {food.name}
      </span>

      {showStatus && food.state && (
        <div className="absolute -top-1 -right-1">
          {food.state.status === 'SAFE' && (
            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-success-foreground" />
            </div>
          )}
          {food.state.status === 'TRYING' && (
            <div className="w-5 h-5 rounded-full bg-warning flex items-center justify-center">
              <Clock className="w-3 h-3 text-warning-foreground" />
            </div>
          )}
          {food.state.status === 'REACTION' && (
            <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-danger-foreground" />
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}
