import { ScrollArea } from '@/components/ui/scroll-area';

export function StepAllergen() {
  const allergens = ['🥜 Peanut', '🥚 Egg', '🥛 Dairy', '🫘 Soy', '🌾 Wheat', '🐟 Fish', '🦐 Shellfish', '🌰 Tree Nuts', '🫒 Sesame'];

  return (
    <ScrollArea className="h-[400px] pr-2">
      <div className="space-y-5">
        <div className="text-center">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-foreground mt-3">The Allergen Protocol</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Early introduction can reduce allergy risk
          </p>
        </div>

        {/* Top 9 Allergens */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="font-semibold text-foreground text-sm mb-2">Top 9 Allergens</p>
          <div className="flex flex-wrap gap-2">
            {allergens.map((allergen) => (
              <span key={allergen} className="text-xs bg-background/80 px-2 py-1 rounded-full">
                {allergen}
              </span>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/30">
          <p className="font-semibold text-foreground text-sm mb-3">📋 The Protocol</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span className="text-muted-foreground">Start with a tiny taste (pea-sized)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span className="text-muted-foreground">Wait and observe for 2+ hours</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span className="text-muted-foreground">If safe, repeat 2-3 times per week</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span className="text-muted-foreground">After 6+ exposures, mark as "Safe"</span>
            </div>
          </div>
        </div>

        {/* When to Introduce */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="font-semibold text-foreground text-sm mb-2">🏠 Best Practices</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Introduce at home, not daycare/restaurants</li>
            <li>• Morning is best (monitor all day)</li>
            <li>• Baby should be healthy, no illness</li>
            <li>• One new allergen at a time</li>
          </ul>
        </div>

        {/* Signs to Watch */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <p className="font-semibold text-foreground text-xs mb-1">⚡ Mild Signs</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Hives, rash</li>
              <li>• Mild swelling</li>
              <li>• Stomach upset</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="font-semibold text-foreground text-xs mb-1">🚨 Severe (Call 911)</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Hard to breathe</li>
              <li>• Widespread hives</li>
              <li>• Vomiting, lethargy</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          💡 You can always review this in the <span className="font-medium text-primary">Allergen tab</span>
        </p>
      </div>
    </ScrollArea>
  );
}
