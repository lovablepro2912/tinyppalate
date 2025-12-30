import { useState } from 'react';
import { FoodProvider } from '@/contexts/FoodContext';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FoodPickerModal } from '@/components/FoodPickerModal';
import { LogFoodModal } from '@/components/LogFoodModal';
import { HomeTab } from '@/components/tabs/HomeTab';
import { FoodDexTab } from '@/components/tabs/FoodDexTab';
import { JournalTab } from '@/components/tabs/JournalTab';
import { SafetyTab } from '@/components/tabs/SafetyTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { FoodWithState } from '@/types/food';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodWithState | null>(null);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);

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
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {activeTab === 'home' && <HomeTab onSelectFood={(food) => handleSelectFood(food, false)} />}
        {activeTab === 'dex' && <FoodDexTab onSelectFood={(food) => handleSelectFood(food, false)} />}
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'safety' && <SafetyTab onSelectFood={handleSelectFood} />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* FAB */}
      {activeTab === 'home' && (
        <FloatingActionButton onClick={() => setShowPicker(true)} />
      )}

      {/* Bottom Nav */}
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
      <AppContent />
    </FoodProvider>
  );
};

export default Index;
