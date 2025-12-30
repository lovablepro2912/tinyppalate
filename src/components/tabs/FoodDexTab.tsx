import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { FoodCard } from '@/components/FoodCard';
import { FoodWithState } from '@/types/food';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FoodDexTabProps {
  onSelectFood: (food: FoodWithState) => void;
}

export function FoodDexTab({ onSelectFood }: FoodDexTabProps) {
  const { getFoodsWithStates, getTriedCount, foods } = useFoodContext();
  
  // Get unique categories from foods
  const categories = useMemo(() => {
    const cats = [...new Set(foods.map(f => f.category))];
    return cats.sort();
  }, [foods]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const allFoods = getFoodsWithStates();
  const triedCount = getTriedCount();

  // Set default category once foods are loaded
  const currentCategory = selectedCategory || categories[0] || '';
  
  const foodsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = allFoods.filter(f => f.category === cat);
    return acc;
  }, {} as Record<string, FoodWithState[]>);

  const currentFoods = foodsByCategory[currentCategory] || [];

  // Get emoji for category
  const getCategoryEmoji = (cat: string) => {
    const categoryEmojis: Record<string, string> = {
      'Fruits': '🍎',
      'Vegetables': '🥦',
      'Proteins': '🍗',
      'Grains': '🌾',
      'Dairy': '🧀',
      'Nuts & Seeds': '🥜',
      'Seafood': '🐟',
      'Eggs': '🥚',
      'Legumes': '🫘',
    };
    return categoryEmojis[cat] || '🍽️';
  };

  return (
    <div className="pb-24 px-4">
      {/* Header */}
      <motion.div 
        className="pt-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Food Dex</h1>
        <p className="text-muted-foreground">
          {triedCount} of {allFoods.length} foods discovered
        </p>
      </motion.div>

      {/* Category Dropdown */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Select value={currentCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border text-base font-medium">
            <SelectValue placeholder="Select category">
              <span className="flex items-center gap-2">
                <span>{getCategoryEmoji(currentCategory)}</span>
                <span>{currentCategory}</span>
                <span className="text-muted-foreground text-sm ml-1">
                  ({foodsByCategory[currentCategory]?.length || 0})
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50 rounded-xl">
            {categories.map(cat => (
              <SelectItem 
                key={cat} 
                value={cat}
                className="h-11 text-base cursor-pointer rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <span>{getCategoryEmoji(cat)}</span>
                  <span>{cat}</span>
                  <span className="text-muted-foreground text-sm ml-1">
                    ({foodsByCategory[cat]?.length || 0})
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Food Grid */}
      <motion.div
        key={currentCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
      >
        {currentFoods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <FoodCard 
              food={food}
              onClick={() => onSelectFood(food)}
              size="lg"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
