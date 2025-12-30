import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, GripHorizontal, Circle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  { key: "6-9mo", label: "6-9 mo" },
  { key: "9-12mo", label: "9-12 mo" },
  { key: "12mo+", label: "12+ mo" },
] as const;

const getIconForGuide = (icon?: string) => {
  switch (icon) {
    case "grip":
      return <GripHorizontal className="h-12 w-12 text-primary" />;
    case "circle":
      return <Circle className="h-12 w-12 text-primary" />;
    case "slice":
    default:
      return <Square className="h-12 w-12 text-primary" />;
  }
};

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
    setTimeout(onClose, 300);
  };

  const handleLogFood = () => {
    if (food) {
      onLogFood(food);
      handleClose();
    }
  };

  if (!food) return null;

  const servingGuide = food.serving_guide as ServingGuide | null;
  const hasServingGuide = servingGuide && Object.keys(servingGuide).length > 0;
  const isHighChokingRisk = food.choking_hazard_level === "High";
  const isAllergen = food.is_allergen;

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

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-background flex flex-col"
          >
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-primary/10 to-background pt-4 pb-6 px-6">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Food Emoji & Name */}
              <div className="text-center pt-4">
                <span className="text-7xl block mb-3">{food.emoji}</span>
                <h2 className="text-2xl font-bold text-foreground">{food.name}</h2>
                <Badge variant="secondary" className="mt-2">
                  {food.category}
                </Badge>
              </div>
            </div>

            {/* Safety Banners */}
            <div className="px-4 space-y-2">
              {isHighChokingRisk && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm font-medium text-destructive">
                    Common Choking Hazard – Always follow preparation guidelines
                  </p>
                </div>
              )}
              {isAllergen && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                    Common Allergen – Introduce carefully and watch for reactions
                  </p>
                </div>
              )}
            </div>

            {/* Serving Guide Tabs */}
            <div className="flex-1 overflow-auto px-4 py-4">
              {hasServingGuide ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full h-12 p-1 bg-muted rounded-xl">
                    {AGE_TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        className="flex-1 h-10 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {AGE_TABS.map((tab) => {
                    const guide = servingGuide[tab.key];
                    return (
                      <TabsContent key={tab.key} value={tab.key} className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-card rounded-2xl p-6 border border-border"
                        >
                          {guide ? (
                            <div className="flex flex-col items-center text-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                {getIconForGuide(guide.icon)}
                              </div>
                              <p className="text-lg leading-relaxed text-foreground">
                                {guide.text}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">
                                No specific guidance for this age range yet.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Square className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    Serving Guide Coming Soon
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    We're working on adding age-specific preparation guidance for this food.
                  </p>
                </div>
              )}
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 p-4 bg-background border-t border-border safe-area-bottom">
              <Button
                onClick={handleLogFood}
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl"
              >
                {getButtonText()}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
