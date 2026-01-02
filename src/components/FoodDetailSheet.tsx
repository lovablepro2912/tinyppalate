import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FoodWithState } from "@/types/food";

interface FoodDetailSheetProps {
  food: FoodWithState | null;
  onClose: () => void;
  onLogFood: (food: FoodWithState) => void;
}

interface ServingGuideEntry {
  text: string;
  icon?: string;
}

interface ServingGuide {
  "6-9mo"?: ServingGuideEntry;
  "9-12mo"?: ServingGuideEntry;
  "12mo+"?: ServingGuideEntry;
}

const AGE_TABS = [
  { key: "6-9mo", label: "6-9 mos" },
  { key: "9-12mo", label: "9-12 mos" },
  { key: "12mo+", label: "12-24 mos" },
] as const;

function FoodImage({ food }: { food: FoodWithState }) {
  const [imageError, setImageError] = useState(false);
  const hasImage = food.image_url && !imageError;

  if (hasImage) {
    return (
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden">
        <img 
          src={food.image_url} 
          alt={food.name}
          className="w-16 h-16 object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return <span className="text-6xl">{food.emoji}</span>;
}

export function FoodDetailSheet({ food, onClose, onLogFood }: FoodDetailSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("6-9mo");

  useEffect(() => {
    if (food) {
      setIsVisible(true);
      setActiveTab("6-9mo");
    }
  }, [food]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleLogFood = () => {
    if (food) {
      onLogFood(food);
      handleClose();
    }
  };

  if (!food) return null;
  if (typeof document === "undefined") return null;

  const servingGuide = food.serving_guide as ServingGuide | null;
  const hasServingGuide = servingGuide && Object.keys(servingGuide).length > 0;
  const isHighChokingRisk = food.choking_hazard_level === "High";
  const isAllergen = food.is_allergen;
  const currentGuide = hasServingGuide ? servingGuide[activeTab as keyof ServingGuide] : null;

  const getButtonText = () => {
    if (!food.state) return "Add to Tracker";
    switch (food.state.status) {
      case "SAFE":
        return "Log Again";
      case "TRYING":
        return "Log Another Try";
      case "REACTION":
        return "Log New Attempt";
      default:
        return "Log First Try";
    }
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[55]"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[92vh] overflow-hidden rounded-t-3xl bg-background flex flex-col"
          >
            {/* Header with Food Info */}
            <div className="relative bg-gradient-to-b from-primary/5 to-background px-5 pt-3 pb-4">
              {/* Drag Handle */}
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-4 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Food Header */}
              <div className="flex items-center gap-4">
                <FoodImage food={food} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{food.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {food.category}
                    </Badge>
                    {isAllergen && (
                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 bg-amber-500/10">
                        Allergen
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Banner */}
            {isHighChokingRisk && (
              <div className="mx-4 mb-3 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-xs font-medium text-destructive">
                  Common Choking Hazard – Follow preparation guidelines carefully
                </p>
              </div>
            )}

            {/* Age Tabs - Solid Starts Style */}
            <div className="px-4 mb-3">
              <div className="flex rounded-full bg-muted p-1">
                {AGE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2.5 px-3 rounded-full text-sm font-semibold transition-all ${
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto px-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentGuide ? (
                    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">How to Serve</h3>
                          <p className="text-base leading-relaxed text-foreground/90">
                            {currentGuide.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : hasServingGuide ? (
                    <div className="bg-muted/30 rounded-2xl p-6 text-center">
                      <p className="text-muted-foreground">
                        No specific guidance for this age range.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Info className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1">Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        We're adding age-specific guidance for this food.
                      </p>
                    </div>
                  )}

                  {/* Additional Tips */}
                  {isAllergen && (
                    <div className="mt-3 bg-amber-500/5 rounded-2xl p-4 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-700 dark:text-amber-500 text-sm">Allergen Alert</h4>
                          <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
                            Introduce early and watch for reactions. Wait 2-3 days before trying new allergens.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background border-t">
              <Button
                onClick={handleLogFood}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl"
              >
                {getButtonText()}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
