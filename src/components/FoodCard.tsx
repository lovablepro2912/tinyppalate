import { useState, useRef } from 'react';
import { FoodWithState } from '@/types/food';
import { CheckCircle, AlertTriangle, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodCardProps {
  food: FoodWithState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  forceColor?: boolean;
  locked?: boolean;
}

export function FoodCard({ food, onClick, size = 'md', showStatus = true, forceColor = false, locked = false }: FoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
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

  const imageSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  // Only apply grayscale if not unlocked, not a reaction, not forced to color, or locked
  const shouldBeGrayscale = locked || (!forceColor && !isUnlocked && !hasReaction);

  // Use image if available and not errored
  const hasImage = food.image_url && !imageError;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only trigger click if movement was minimal (tap, not scroll)
    if (deltaX < 10 && deltaY < 10) {
      e.preventDefault();
      onClick?.();
    }
    
    touchStartRef.current = null;
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-2xl",
        "bg-card card-shadow border border-border/50",
        "touch-fix transition-transform duration-150",
        "hover:-translate-y-0.5 active:scale-95",
        hasReaction && !locked && "ring-2 ring-danger/50 bg-danger/5",
        locked && "opacity-70"
      )}
    >
      <div className={cn(
        sizeClasses[size],
        "flex items-center justify-center rounded-xl overflow-hidden",
        !hasImage && "bg-secondary/50",
        shouldBeGrayscale && "grayscale-food",
        locked && "blur-sm"
      )}>
        {hasImage ? (
          <img 
            src={food.image_url} 
            alt={food.name}
            className={cn(imageSizes[size], "object-contain")}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={emojiSizes[size]}>{food.emoji}</span>
        )}
      </div>
      
      <span className={cn(
        "text-xs font-medium text-foreground text-center line-clamp-1 max-w-full px-1",
        locked && "blur-sm"
      )}>
        {food.name}
      </span>

      {/* Lock icon for locked items */}
      {locked && (
        <div className="absolute -top-1 -right-1">
          <div className="w-5 h-5 rounded-full bg-muted-foreground flex items-center justify-center">
            <Lock className="w-3 h-3 text-background" />
          </div>
        </div>
      )}

      {/* Status badge for unlocked items */}
      {!locked && showStatus && food.state && (
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
    </button>
  );
}
