import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FoodCard } from '@/components/FoodCard';
import { FoodDetailSheet } from '@/components/FoodDetailSheet';
import { PaywallSheet } from '@/components/PaywallSheet';
import { FoodWithState } from '@/types/food';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  
  // Get unique categories from foods, with "All" as first option
  const categories = useMemo(() => {
    const cats = [...new Set(foods.map(f => f.category))];
    return ['All', ...cats.sort()];
  }, [foods]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodWithState | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const allFoods = getFoodsWithStates();
  const triedCount = getTriedCount();

  // Set default category once foods are loaded
  const currentCategory = selectedCategory || categories[0] || '';

  const handleFoodClick = (food: FoodWithState) => {
    // If allergen and not premium, show paywall instead
    if (food.is_allergen && !isPremium && !subscriptionLoading) {
      setShowPaywall(true);
      return;
    }
    setSelectedFoodForDetail(food);
  };

  const handleCloseDetail = () => {
    setSelectedFoodForDetail(null);
  };

  const handleLogFromDetail = (food: FoodWithState) => {
    onSelectFood(food);
  };
  
  const foodsByCategory = useMemo(() => {
    const result: Record<string, FoodWithState[]> = {
      'All': [...allFoods].sort((a, b) => a.name.localeCompare(b.name)),
    };
    categories.filter(c => c !== 'All').forEach(cat => {
      result[cat] = allFoods.filter(f => f.category === cat);
    });
    return result;
  }, [allFoods, categories]);

  // Filter foods based on search query
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return foodsByCategory[currentCategory] || [];
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allFoods.filter(food => 
      food.name.toLowerCase().includes(query)
    );
  }, [searchQuery, allFoods, foodsByCategory, currentCategory]);

  // Get emoji for category
  const getCategoryEmoji = (cat: string) => {
    const categoryEmojis: Record<string, string> = {
      'All': '📋',
      'Fruit': '🍎',
      'Fruits': '🍎',
      'Vegetable': '🥦',
      'Vegetables': '🥦',
      'Protein': '🍗',
      'Proteins': '🍗',
      'Grains': '🌾',
      'Dairy': '🧀',
      'Nuts & Seeds': '🥜',
      'Legumes': '🫘',
      'Seafood': '🐟',
      'Eggs': '🥚',
    };
    return categoryEmojis[cat] || '🍽️';
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="px-4">
      {/* Header */}
      <motion.div 
        className="pt-2 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Food Dex</h1>
        <p className="text-muted-foreground">
          {triedCount} of {allFoods.length} foods discovered
        </p>
      </motion.div>

      {/* Search Box */}
      <motion.div 
        className="mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-10 h-12 rounded-xl bg-card border-border text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Dropdown - hide when searching */}
      {!isSearching && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Select value={currentCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border text-base font-medium">
              <SelectValue placeholder="Select category">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="flex-shrink-0">{getCategoryEmoji(currentCategory)}</span>
                  <span className="truncate">{currentCategory}</span>
                  <span className="text-muted-foreground text-sm flex-shrink-0">
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
      )}

      {/* Search Results Label */}
      {isSearching && (
        <motion.p 
          className="text-sm text-muted-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} for "{searchQuery}"
        </motion.p>
      )}

      {/* Food Grid */}
      <motion.div
        key={isSearching ? 'search' : currentCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
      >
        {filteredFoods.map((food, index) => {
          const isLocked = food.is_allergen && !isPremium && !subscriptionLoading;
          return (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              <FoodCard 
                food={food}
                onClick={() => handleFoodClick(food)}
                size="lg"
                locked={isLocked}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filteredFoods.length === 0 && isSearching && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-muted-foreground">No foods found for "{searchQuery}"</p>
        </motion.div>
      )}

      {/* Food Detail Sheet */}
      <FoodDetailSheet
        food={selectedFoodForDetail}
        onClose={handleCloseDetail}
        onLogFood={handleLogFromDetail}
      />

      {/* Paywall Sheet */}
      <PaywallSheet 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </div>
  );
}
