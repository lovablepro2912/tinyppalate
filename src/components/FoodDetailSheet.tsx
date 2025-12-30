import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FoodWithState } from '@/types/food';
import { AlertTriangle, ChevronDown, X, Baby, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FoodDetailSheetProps {
  food: FoodWithState | null;
  onClose: () => void;
  onLogFood: (food: FoodWithState) => void;
}

interface ServingGuide {
  '6-9mo'?: string;
  '9-12mo'?: string;
  '12mo+'?: string;
}

const AGE_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  '6-9mo': { 
    label: '6-9 months', 
    icon: '👶',
    description: 'Palmar grasp, larger pieces'
  },
  '9-12mo': { 
    label: '9-12 months', 
    icon: '🧒',
    description: 'Pincer grasp developing'
  },
  '12mo+': { 
    label: '12+ months', 
    icon: '👦',
    description: 'More advanced eating skills'
  },
};

export function FoodDetailSheet({ food, onClose, onLogFood }: FoodDetailSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleLogFood = () => {
    if (food) {
      onLogFood(food);
      handleClose();
    }
  };

  const servingGuide = food?.serving_guide as ServingGuide | null;
  const chokingLevel = food?.choking_hazard_level as 'Low' | 'Moderate' | 'High' | null;

  const getChokingBadgeVariant = (level: string | null) => {
    switch (level) {
      case 'High':
        return 'destructive';
      case 'Moderate':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const hasServingGuide = servingGuide && Object.keys(servingGuide).length > 0;

  return (
    <AnimatePresence>
      {food && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClosing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isClosing ? '100%' : 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] rounded-t-3xl bg-card shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors z-10"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
              {/* Hero Section */}
              <div className="text-center mb-6">
                <div className="text-7xl mb-3">{food.emoji}</div>
                <h2 className="text-2xl font-bold text-foreground">{food.name}</h2>
                <p className="text-muted-foreground capitalize">{food.category}</p>
                
                {/* Badges */}
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  {food.is_allergen && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">
                      ⚠️ Allergen
                    </Badge>
                  )}
                  {chokingLevel && (
                    <Badge variant={getChokingBadgeVariant(chokingLevel)}>
                      {chokingLevel === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {chokingLevel} Choking Risk
                    </Badge>
                  )}
                </div>
              </div>

              {/* High Choking Hazard Warning */}
              {chokingLevel === 'High' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/30"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive">Common Choking Hazard</h3>
                      <p className="text-sm text-destructive/80 mt-1">
                        This food requires careful preparation. Always follow age-appropriate serving guidelines below.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* How to Serve Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">How to Serve</h3>
                </div>

                {hasServingGuide ? (
                  <Accordion type="single" collapsible defaultValue="6-9mo" className="space-y-2">
                    {Object.entries(servingGuide).map(([ageKey, instruction]) => {
                      const ageInfo = AGE_LABELS[ageKey];
                      if (!instruction || !ageInfo) return null;

                      return (
                        <AccordionItem
                          key={ageKey}
                          value={ageKey}
                          className="border rounded-2xl bg-background px-4 overflow-hidden"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3 text-left">
                              <span className="text-2xl">{ageInfo.icon}</span>
                              <div>
                                <div className="font-semibold text-foreground">{ageInfo.label}</div>
                                <div className="text-xs text-muted-foreground">{ageInfo.description}</div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="bg-muted/50 rounded-xl p-4">
                              <p className="text-foreground leading-relaxed">{instruction}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <div className="bg-muted/30 rounded-2xl p-6 text-center">
                    <Baby className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Serving Guide Coming Soon</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      We're working on adding safety instructions for this food.
                    </p>
                  </div>
                )}
              </div>

              {/* Food Status */}
              {food.state && (
                <div className="mb-4 p-4 rounded-2xl bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Status</span>
                    <Badge variant="secondary">
                      {food.state.status === 'SAFE' && '✅ Safe'}
                      {food.state.status === 'TRYING' && `🔄 ${food.state.exposure_count}/3 tries`}
                      {food.state.status === 'REACTION' && '⚠️ Reaction'}
                      {food.state.status === 'TO_TRY' && '📋 To Try'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 p-4 border-t border-border bg-card safe-area-bottom">
              <Button
                onClick={handleLogFood}
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-2xl"
              >
                {food.state ? '📝 Log This Food' : '🍽️ Mark as Tried'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}