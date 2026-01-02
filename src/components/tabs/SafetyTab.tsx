import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AllergenCard } from '@/components/AllergenCard';
import { PaywallSheet } from '@/components/PaywallSheet';
import { FoodWithState } from '@/types/food';
import { ShieldCheck, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Search, X, Info, Baby, Heart, Phone, Lock, Crown, Star, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { PoisonControlBanner } from '@/components/PoisonControlBanner';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getPoisonControlInfo } from '@/data/poisonControlNumbers';

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
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { countryCode } = useUserLocation();
  const emergencyInfo = getPoisonControlInfo(countryCode || 'US');
  
  const allergens = getAllergenFoods();
  const safeCount = allergens.filter(f => f.state?.status === 'SAFE').length;
  const tryingCount = allergens.filter(f => f.state?.status === 'TRYING').length;
  const reactionCount = allergens.filter(f => f.state?.status === 'REACTION').length;

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

  // Family order for display with emojis and notes
  const allergenFamilies: Record<string, { emoji: string; note?: string }> = {
    'Dairy': { emoji: '🥛', note: 'Lactose intolerance ≠ milk allergy' },
    'Peanut': { emoji: '🥜', note: 'Peanuts are NOT tree nuts' },
    'Tree Nut': { emoji: '🌰', note: 'One nut safe ≠ all nuts safe' },
    'Soy': { emoji: '🌱' },
    'Wheat': { emoji: '🌾', note: 'Wheat allergy ≠ celiac disease' },
    'Fish': { emoji: '🐟', note: 'One fish safe ≠ all fish safe' },
    'Shellfish': { emoji: '🦐', note: 'Shellfish ≠ fish (separate groups)' },
    'Sesame': { emoji: '🌰' },
    'Egg': { emoji: '🥚' },
  };
  const familyOrder = ['Dairy', 'Peanut', 'Tree Nut', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame', 'Egg'];

  // Filter and group allergens based on search
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Group allergens by family
    const groupedAllergens = allergens.reduce<Record<string, FoodWithState[]>>((acc, food) => {
      const family = food.allergen_family || 'Other';
      if (!acc[family]) acc[family] = [];
      acc[family].push(food);
      return acc;
    }, {});

    // Create ordered groups and filter by search
    return familyOrder
      .filter(family => groupedAllergens[family])
      .map(family => {
        const allFoods = groupedAllergens[family];
        // Filter foods within group if searching
        const filteredFoods = query 
          ? allFoods.filter(f => 
              f.name.toLowerCase().includes(query) || 
              family.toLowerCase().includes(query)
            )
          : allFoods;
        
        return {
          family,
          foods: filteredFoods,
          allFoods, // Keep original for status calculation
          status: getGroupStatus(allFoods),
          safeCount: allFoods.filter(f => f.state?.status === 'SAFE').length,
          totalCount: allFoods.length
        };
      })
      .filter(group => group.foods.length > 0); // Only show groups with matching foods
  }, [allergens, searchQuery]);

  const STORAGE_KEY = 'allergen-protocol-open-groups';

  // Track which groups are open - default to all collapsed, load from localStorage
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(parsed);
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return new Set(); // Default to all collapsed
  });

  // Persist to localStorage when openGroups changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...openGroups]));
    } catch (e) {
      // Ignore storage errors
    }
  }, [openGroups]);

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

  const expandAll = () => {
    setOpenGroups(new Set(familyOrder));
  };

  const collapseAll = () => {
    setOpenGroups(new Set());
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

  // Check if content should be locked
  const isLocked = !isPremium && !subscriptionLoading;

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
          {isLocked && (
            <div className="ml-auto flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          )}
        </div>
        <p className="text-muted-foreground mb-2">
          Safely introduce the Top 9 allergens with our guided protocol
        </p>
        <motion.button
          onClick={() => isLocked ? setShowPaywall(true) : setShowInfoSheet(true)}
          className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              {isLocked ? <Lock className="w-5 h-5 text-primary-foreground" /> : <Info className="w-5 h-5 text-primary-foreground" />}
            </div>
            <div className="text-left">
              <p className="font-semibold text-primary-foreground">Learn about the protocol</p>
              <p className="text-xs text-primary-foreground/80">
                {isLocked ? 'Unlock with Premium' : 'Safety tips and how it works'}
              </p>
            </div>
          </div>
          {isLocked ? <Crown className="w-5 h-5 text-primary-foreground/80" /> : <ChevronRight className="w-5 h-5 text-primary-foreground/80" />}
        </motion.button>
      </motion.div>

      {/* Allergen Info Sheet */}
      <Sheet open={showInfoSheet} onOpenChange={setShowInfoSheet}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="text-left pb-2">
            <SheetTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Allergen Introduction Guide
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-80px)] pr-4">
            <div className="space-y-6 pb-8">
              {/* What is the Allergen Protocol */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">What is the Allergen Protocol?</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    The allergen introduction protocol is based on landmark research (like the LEAP study) 
                    showing that <span className="text-foreground font-medium">early, consistent exposure</span> to 
                    common allergens can significantly reduce the risk of developing food allergies.
                  </p>
                  <p>
                    The Top 9 allergens account for 90% of all food allergies: <span className="font-medium text-foreground">
                    Peanut, Egg, Dairy, Soy, Wheat, Fish, Shellfish, Sesame,</span> and <span className="font-medium text-foreground">Tree Nuts</span>.
                  </p>
                </div>
              </section>

              {/* How the Protocol Works */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h3 className="font-bold text-foreground">How It Works</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-3">
                  <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                    <p><span className="font-bold text-foreground">Step 1:</span> Start with a tiny amount of the allergen (a lick or small taste)</p>
                    <p><span className="font-bold text-foreground">Step 2:</span> Wait and observe for 2+ hours after first exposure</p>
                    <p><span className="font-bold text-foreground">Step 3:</span> If no reaction, continue offering 2-3 times per week</p>
                    <p><span className="font-bold text-foreground">Step 4:</span> After 6+ successful exposures, mark as "Safe"</p>
                  </div>
                  <p className="text-xs italic">
                    Your baby's status progresses: To Try → Trying → Safe
                  </p>
                </div>
              </section>

              {/* Safety Guidelines */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-danger" />
                  <h3 className="font-bold text-foreground">Safety Guidelines</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><span className="font-medium text-foreground">Introduce at home</span> — never at daycare, restaurants, or while traveling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><span className="font-medium text-foreground">Morning is best</span> — you can monitor throughout the day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><span className="font-medium text-foreground">One new allergen at a time</span> — wait 3-5 days between new allergens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><span className="font-medium text-foreground">Stay focused</span> — have one adult dedicated to watching baby during and after feeding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><span className="font-medium text-foreground">Baby should be healthy</span> — avoid introducing during illness</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Signs of a Reaction */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h3 className="font-bold text-foreground">Signs of a Reaction</h3>
                </div>
                <div className="text-sm space-y-3">
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-3">
                    <p className="font-medium text-foreground mb-2">Mild Reactions (call pediatrician):</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Hives or skin rash around mouth/face</li>
                      <li>• Mild swelling of lips or eyes</li>
                      <li>• Stomach upset, vomiting, or diarrhea</li>
                      <li>• Runny nose or sneezing</li>
                    </ul>
                  </div>
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-3">
                    <p className="font-medium text-foreground mb-2">🚨 Severe Reactions:</p>
                    <ul className="text-muted-foreground space-y-1 text-xs mb-3">
                      <li>• Difficulty breathing or wheezing</li>
                      <li>• Widespread hives over the body</li>
                      <li>• Repeated vomiting</li>
                      <li>• Sudden lethargy or unresponsiveness</li>
                      <li>• Swelling of tongue or throat</li>
                    </ul>
                    <a
                      href={`tel:${emergencyInfo.emergencyNumber}`}
                      className="flex items-center justify-center gap-2 bg-danger text-white font-bold py-2.5 px-4 rounded-lg hover:bg-danger/90 transition-colors w-full"
                    >
                      <Phone className="w-4 h-4" />
                      Call {emergencyInfo.emergencyNumber} Immediately
                    </a>
                  </div>
                </div>
              </section>

              {/* Tips for Success */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Tips for Success</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Mix allergens into foods your baby already loves</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Be consistent — sporadic exposure may actually increase sensitization risk</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Don't give up after one refusal — babies often need 10+ tries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Keep a log of exposures and reactions (this app helps!)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Consult your pediatrician if you have a family history of allergies</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Emergency Note */}
              <section className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">Be Prepared</h3>
                  <p className="text-xs text-muted-foreground">
                    Always have your pediatrician's number and local emergency services readily available. 
                    If your baby has been prescribed an EpiPen, know how to use it and keep it nearby during introductions.
                  </p>
                </div>
                <PoisonControlBanner />
              </section>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Stats */}
      <motion.div
        className={cn("grid grid-cols-3 gap-3 mb-6", isLocked && "blur-sm")}
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

      {/* Search Bar and Expand/Collapse - Hidden for locked users */}
      {!isLocked && (
        <motion.div
          className="mb-4 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search allergens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-muted/50 border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={expandAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Expand All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={collapseAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Collapse All
            </Button>
          </div>
        </motion.div>
      )}

      {/* Allergen Groups */}
      <div className="relative">
        <motion.div
          className={cn("space-y-3", isLocked && "pointer-events-none")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {(isLocked ? filteredGroups.slice(0, 2) : filteredGroups).map((group, index) => (
            <motion.div
              key={group.family}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className={cn(isLocked && index === 1 && "opacity-50 blur-[2px]")}
            >
              <Collapsible 
                open={!isLocked && openGroups.has(group.family)}
                onOpenChange={() => !isLocked && toggleGroup(group.family)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all",
                      "flex items-center justify-between",
                      !isLocked && "hover:scale-[1.01] active:scale-[0.99]",
                      getGroupBgClass(group.status)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{allergenFamilies[group.family]?.emoji || '🍽️'}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">
                            {group.family} <span className="font-normal text-muted-foreground">{group.safeCount}/{group.totalCount}</span>
                          </h3>
                          {group.status === 'safe' && <CheckCircle className="w-4 h-4 text-success" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {allergenFamilies[group.family]?.note && (
                            <span className="text-primary/70">{allergenFamilies[group.family].note}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown 
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          openGroups.has(group.family) && "rotate-180"
                        )} 
                      />
                    )}
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

        {/* Clickable overlay for locked state */}
        {isLocked && (
          <button
            onClick={() => setShowPaywall(true)}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label="Unlock allergen protocol"
          />
        )}
      </div>

      {/* Unlock CTA for non-premium users */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mb-8"
        >
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-2xl card-shadow p-5 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Unlock Allergen Protocol</h3>
                <p className="text-sm text-muted-foreground">Track all 9 major allergens safely</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPaywall(true)}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:opacity-90 border-0 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Upgrade to Premium</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Paywall Sheet */}
      <PaywallSheet 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </div>
  );
}
