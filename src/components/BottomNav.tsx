import { Home, Grid3X3, ScrollText, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dex', label: 'Food Dex', icon: Grid3X3 },
  { id: 'journal', label: 'Journal', icon: ScrollText },
  { id: 'safety', label: 'Safety', icon: ShieldCheck },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2 safe-area-x">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-3 py-1.5 rounded-xl transition-all",
                "relative touch-target no-select",
                "active:scale-95"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                />
              )}
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
    </nav>
  );
}
