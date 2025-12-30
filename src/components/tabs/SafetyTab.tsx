import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { AllergenCard } from '@/components/AllergenCard';
import { FoodWithState } from '@/types/food';
import { ShieldCheck, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SafetyTabProps {
  onSelectFood: (food: FoodWithState, showSafety: boolean) => void;
}

type GroupStatus = 'safe' | 'trying' | 'reaction' | 'to_try';

interface AllergenGroup {
  family: string;
  foods: FoodWithState[];
  status: GroupStatus;
  safeCount: number;
  totalCount: number;
}

export function SafetyTab({ onSelectFood }: SafetyTabProps) {
  const { getAllergenFoods } = useFoodContext();
  
  const allergens = getAllergenFoods();
  const safeCount = allergens.filter(f => f.state?.status === 'SAFE').length;
  const tryingCount = allergens.filter(f => f.state?.status === 'TRYING').length;
  const reactionCount = allergens.filter(f => f.state?.status === 'REACTION').length;

  // Group allergens by family
  const groupedAllergens = allergens.reduce<Record<string, FoodWithState[]>>((acc, food) => {
    const family = food.allergen_family || 'Other';
    if (!acc[family]) acc[family] = [];
    acc[family].push(food);
    return acc;
  }, {});

  // Calculate group status
  const getGroupStatus = (foods: FoodWithState[]): GroupStatus => {
    const hasReaction = foods.some(f => f.state?.status === 'REACTION');
    if (hasReaction) return 'reaction';
    
    const allSafe = foods.every(f => f.state?.status === 'SAFE');
    if (allSafe) return 'safe';
    
    const hasTrying = foods.some(f => f.state?.status === 'TRYING');
    if (hasTrying) return 'trying';
    
    return 'to_try';
  };

  // Create ordered groups with status
  const familyOrder = ['Peanut', 'Egg', 'Dairy', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame', 'Tree Nut'];
  
  const orderedGroups: AllergenGroup[] = familyOrder
    .filter(family => groupedAllergens[family])
    .map(family => {
      const foods = groupedAllergens[family];
      return {
        family,
        foods,
        status: getGroupStatus(foods),
        safeCount: foods.filter(f => f.state?.status === 'SAFE').length,
        totalCount: foods.length
      };
    });

  // Track which groups are open
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    // Default open groups that are in progress
    const inProgress = new Set<string>();
    orderedGroups.forEach(g => {
      if (g.status === 'trying' || g.status === 'to_try') {
        inProgress.add(g.family);
      }
    });
    return inProgress;
  });

  const toggleGroup = (family: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  };

  const getGroupStatusIcon = (status: GroupStatus) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'reaction':
        return <AlertTriangle className="w-5 h-5 text-danger" />;
      case 'trying':
        return <div className="w-5 h-5 rounded-full bg-warning flex items-center justify-center">
          <span className="text-[10px] font-bold text-warning-foreground">...</span>
        </div>;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getGroupBgClass = (status: GroupStatus) => {
    switch (status) {
      case 'safe': return 'bg-success/5 border-success/20';
      case 'reaction': return 'bg-danger/5 border-danger/20';
      case 'trying': return 'bg-warning/5 border-warning/20';
      default: return 'bg-muted/50 border-border';
    }
  };

  return (
    <div className="pb-24 px-4">
      {/* Header */}
      <motion.div 
        className="pt-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Allergen Protocol</h1>
        </div>
        <p className="text-muted-foreground">
          Safely introduce the Top 9 allergens with our guided protocol
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-success/10 rounded-2xl p-3 text-center">
          <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold text-success">{safeCount}</p>
          <p className="text-xs text-muted-foreground">Safe</p>
        </div>
        <div className="bg-warning/10 rounded-2xl p-3 text-center">
          <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-warning flex items-center justify-center">
            <span className="text-xs font-bold text-warning-foreground">{tryingCount}</span>
          </div>
          <p className="text-2xl font-bold text-warning">{tryingCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-danger/10 rounded-2xl p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-danger mx-auto mb-1" />
          <p className="text-2xl font-bold text-danger">{reactionCount}</p>
          <p className="text-xs text-muted-foreground">Reactions</p>
        </div>
      </motion.div>

      {/* Allergen Groups */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {orderedGroups.map((group, index) => (
          <motion.div
            key={group.family}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.03 }}
          >
            <Collapsible 
              open={openGroups.has(group.family)}
              onOpenChange={() => toggleGroup(group.family)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all",
                    "flex items-center justify-between",
                    "hover:scale-[1.01] active:scale-[0.99]",
                    getGroupBgClass(group.status)
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getGroupStatusIcon(group.status)}
                    <div className="text-left">
                      <h3 className="font-bold text-foreground">{group.family}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.safeCount}/{group.totalCount} cleared
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      openGroups.has(group.family) && "rotate-180"
                    )} 
                  />
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-2">
                  {group.foods.map((food) => (
                    <AllergenCard 
                      key={food.id}
                      food={food}
                      onClick={() => onSelectFood(food, !food.state || food.state.status === 'TO_TRY')}
                      compact
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
