import { useState, useEffect, useRef } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { FoodProvider } from '@/contexts/FoodContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { BottomNav } from '@/components/BottomNav';
import { FoodPickerModal } from '@/components/FoodPickerModal';
import { LogFoodModal } from '@/components/LogFoodModal';
import { HomeTab } from '@/components/tabs/HomeTab';
import { FoodDexTab } from '@/components/tabs/FoodDexTab';
import { JournalTab } from '@/components/tabs/JournalTab';
import { SafetyTab } from '@/components/tabs/SafetyTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { FoodWithState } from '@/types/food';

function AppContent() {
  // Initialize push notifications for native platforms
  usePushNotifications();
  
  const [activeTab, setActiveTab] = useState('home');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodWithState | null>(null);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top when changing tabs - scroll the main container, not window
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [activeTab]);

  const handleSelectFood = (food: FoodWithState, showSafety: boolean = false) => {
    setSelectedFood(food);
    setShowSafetyWarning(showSafety && food.is_allergen);
    setShowPicker(false);
  };

  const handleCloseLogModal = () => {
    setSelectedFood(null);
    setShowSafetyWarning(false);
  };

  return (
    <div className="h-screen bg-background safe-area-top flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-none max-w-lg mx-auto w-full safe-area-x pb-0">
        {activeTab === 'home' && <HomeTab onSelectFood={(food) => handleSelectFood(food, false)} />}
        {activeTab === 'dex' && <FoodDexTab onSelectFood={(food) => handleSelectFood(food, false)} />}
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'allergen' && <SafetyTab onSelectFood={handleSelectFood} />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Nav - Fixed at bottom */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Food Picker Modal */}
      <FoodPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFood={(food) => handleSelectFood(food, food.is_allergen && (!food.state || food.state.status === 'TO_TRY'))}
      />

      {/* Log Food Modal */}
      <LogFoodModal
        food={selectedFood}
        onClose={handleCloseLogModal}
        showSafetyWarning={showSafetyWarning}
      />
    </div>
  );
}

const Index = () => {
  return (
    <FoodProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </FoodProvider>
  );
};

export default Index;
