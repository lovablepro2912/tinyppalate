import { useRef } from 'react';
import { Home, Grid3X3, ScrollText, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dex', label: 'Food Dex', icon: Grid3X3 },
  { id: 'journal', label: 'Journal', icon: ScrollText },
  { id: 'allergen', label: 'Allergen', icon: AlertTriangle },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { selection } = useHaptics();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    // Fire haptic after state change to avoid blocking
    if (tabId !== activeTab) {
      selection();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent, tabId: string) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only trigger click if movement was minimal (tap, not scroll)
    if (deltaX < 10 && deltaY < 10) {
      e.preventDefault();
      handleTabChange(tabId);
    }
    
    touchStartRef.current = null;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/50">
      {/* Background extension for iOS bounce scrolling */}
      <div className="absolute inset-x-0 top-0 -bottom-[100px] bg-card -z-10" />
      
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2 safe-area-x">
        {/* ... nav buttons ... */}
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, tab.id)}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-3 py-1.5 rounded-xl",
                "relative touch-target no-select touch-fix",
                "transition-transform duration-150 active:scale-95"
              )}
            >
              {/* CSS-based active indicator instead of Framer Motion layoutId */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-200",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}
              />
              <tab.icon className={cn(
                "w-5 h-5 transition-colors relative z-10",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-semibold transition-colors relative z-10 leading-tight",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer */}
      <div className="safe-area-bottom" />
    </nav>
  );
}
