import { Home, Grid3X3, ScrollText, AlertTriangle, User } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
  
  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      selection();
    }
    onTabChange(tabId);
  };
  
  if (typeof document === "undefined") return null;

  return createPortal(
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Actual nav bar */}
      <div className="border-t bg-background/80 backdrop-blur-md">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-2 safe-area-x">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-3 py-1.5 rounded-xl transition-all",
                  "relative no-select touch-manipulation",
                  "active:scale-95"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl pointer-events-none"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  />
                )}
                <tab.icon
                  className={cn(
                    "w-5 h-5 relative z-10",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold relative z-10 leading-tight",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe-area extension (NOT padding) */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-md" />
    </nav>,
    document.body
  );
}
