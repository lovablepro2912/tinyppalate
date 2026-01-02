import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, PartyPopper, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCelebration } from '@/hooks/useCelebration';
import { useEffect } from 'react';

interface PremiumWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UNLOCKED_FEATURES = [
  'Full Allergen Protocol access',
  'Track all 9 major allergens',
  'Detailed serving guides',
  'Unlimited food logging',
];

export function PremiumWelcomeModal({ isOpen, onClose }: PremiumWelcomeModalProps) {
  const { celebrate } = useCelebration();

  useEffect(() => {
    if (isOpen) {
      // Trigger celebration when modal opens
      const timer = setTimeout(() => {
        celebrate('premium');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, celebrate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient header */}
            <div className="relative h-40 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              
              {/* Floating particles */}
              <motion.div
                animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-6 left-8"
              >
                <Sparkles className="w-6 h-6 text-white/60" />
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 right-10"
              >
                <Star className="w-5 h-5 text-white/50 fill-white/50" />
              </motion.div>
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-8 left-12"
              >
                <Star className="w-4 h-4 text-white/40 fill-white/40" />
              </motion.div>

              {/* Main icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="relative z-10"
              >
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <PartyPopper className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/80 hover:bg-black/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Welcome to Premium!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6"
              >
                You now have full access to all features
              </motion.p>

              {/* Unlocked features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 mb-6"
              >
                {UNLOCKED_FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:opacity-90 border-0 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                  <span className="relative z-10">Start Exploring</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
