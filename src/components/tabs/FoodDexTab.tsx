import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { FoodCard } from '@/components/FoodCard';
import { FoodWithState } from '@/types/food';
import { Button } from '@/components/ui/button';

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

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        {categories.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={currentCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full flex-shrink-0"
          >
            {cat}
          </Button>
        ))}
      </div>

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
            transition={{ delay: index * 0.05 }}
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
