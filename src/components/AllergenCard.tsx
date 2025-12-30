import { motion } from 'framer-motion';
import { FoodWithState } from '@/types/food';
import { AlertTriangle, CheckCircle, ShieldAlert, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AllergenCardProps {
  food: FoodWithState;
  onClick?: () => void;
  compact?: boolean;
}

export function AllergenCard({ food, onClick, compact = false }: AllergenCardProps) {
  const state = food.state;
  const exposureCount = state?.exposure_count || 0;
  const status = state?.status || 'TO_TRY';

  const getStatusConfig = () => {
    if (status === 'REACTION') {
      return {
        bgClass: 'bg-danger/10 border-danger/30',
        icon: <ShieldAlert className="w-4 h-4 text-danger" />,
        label: 'Reaction',
        labelClass: 'text-danger',
        showProgress: false,
      };
    }
    if (status === 'SAFE') {
      return {
        bgClass: 'bg-success/10 border-success/30',
        icon: <CheckCircle className="w-4 h-4 text-success" />,
        label: 'Safe',
        labelClass: 'text-success',
        showProgress: false,
      };
    }
    if (status === 'TRYING') {
      return {
        bgClass: 'bg-warning/10 border-warning/30',
        icon: null,
        label: `${exposureCount}/3`,
        labelClass: 'text-warning-foreground',
        showProgress: true,
      };
    }
    return {
      bgClass: 'bg-muted border-border',
      icon: <Play className="w-3 h-3" />,
      label: 'Start',
      labelClass: 'text-muted-foreground',
      showProgress: false,
    };
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <motion.button
        onClick={status !== 'REACTION' ? onClick : undefined}
        disabled={status === 'REACTION'}
        className={cn(
          "w-full p-3 rounded-xl border transition-all text-left",
          config.bgClass,
          status !== 'REACTION' && "hover:scale-[1.01] active:scale-[0.99]",
          status === 'REACTION' && "opacity-80 cursor-not-allowed"
        )}
        whileHover={status !== 'REACTION' ? { y: -1 } : {}}
        whileTap={status !== 'REACTION' ? { scale: 0.99 } : {}}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
            "bg-card shadow-sm",
            status === 'TO_TRY' && "grayscale-food"
          )}>
            {food.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm">{food.name}</h4>
          </div>

          <div className="flex items-center gap-2">
            {config.showProgress ? (
              <div className="flex items-center gap-2">
                <Progress 
                  value={(exposureCount / 3) * 100} 
                  className="h-1.5 w-12 bg-warning/20"
                />
                <span className={cn("text-xs font-medium", config.labelClass)}>
                  {config.label}
                </span>
              </div>
            ) : (
              <>
                {config.icon}
                <span className={cn("text-xs font-medium", config.labelClass)}>
                  {config.label}
                </span>
              </>
            )}
          </div>

          {status === 'REACTION' && (
            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={status !== 'REACTION' ? onClick : undefined}
      disabled={status === 'REACTION'}
      className={cn(
        "w-full p-4 rounded-2xl border-2 transition-all text-left",
        config.bgClass,
        status !== 'REACTION' && "hover:scale-[1.02] active:scale-[0.98]",
        status === 'REACTION' && "opacity-80 cursor-not-allowed"
      )}
      whileHover={status !== 'REACTION' ? { y: -2 } : {}}
      whileTap={status !== 'REACTION' ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
          "bg-card shadow-sm",
          status === 'TO_TRY' && "grayscale-food"
        )}>
          {food.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{food.name}</h3>
            {food.allergen_family && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {food.allergen_family}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {config.icon}
            <span className={cn("text-sm font-medium", config.labelClass)}>
              {config.label}
            </span>
          </div>

          {config.showProgress && (
            <div className="mt-2">
              <Progress 
                value={(exposureCount / 3) * 100} 
                className="h-2 bg-warning/20"
              />
            </div>
          )}
        </div>

        {status === 'REACTION' && (
          <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0" />
        )}
      </div>
    </motion.button>
  );
}
