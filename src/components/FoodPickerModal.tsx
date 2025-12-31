import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFoodContext } from '@/contexts/FoodContext';
import { FoodWithState } from '@/types/food';
import { cn } from '@/lib/utils';

interface FoodPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodWithState) => void;
}

function FoodPickerItem({ food, onClick }: { food: FoodWithState; onClick: () => void }) {
  const [imageError, setImageError] = useState(false);
  const isUnlocked = food.state && (food.state.status === 'SAFE' || food.state.status === 'TRYING');
  const hasImage = food.image_url && !imageError;

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2"
      whileTap={{ scale: 0.95 }}
    >
      <div className={cn(
        "w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden",
        !isUnlocked && food.state?.status !== 'REACTION' && "grayscale-food"
      )}>
        {hasImage ? (
          <img 
            src={food.image_url} 
            alt={food.name}
            className="w-10 h-10 object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-2xl">{food.emoji}</span>
        )}
      </div>
      <span className="text-xs font-medium text-foreground text-center line-clamp-1">
        {food.name}
      </span>
    </motion.button>
  );
}

export function FoodPickerModal({ isOpen, onClose, onSelectFood }: FoodPickerModalProps) {
  const { getFoodsWithStates, foods } = useFoodContext();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from foods
  const categories = useMemo(() => {
    const cats = [...new Set(foods.map(f => f.category))];
    return cats.sort();
  }, [foods]);

  const allFoods = getFoodsWithStates();
  
  const filteredFoods = allFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-card rounded-t-3xl card-shadow overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card z-10 p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Log Food</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search foods..."
                className="pl-10 rounded-xl bg-secondary border-0"
                maxLength={100}
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              <Button
                size="sm"
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full flex-shrink-0"
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full flex-shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Food Grid */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-4 gap-3">
              {filteredFoods.map(food => (
                <FoodPickerItem 
                  key={food.id} 
                  food={food} 
                  onClick={() => onSelectFood(food)} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
