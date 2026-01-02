import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, HeartPulse, CalendarClock, ScrollText, Infinity, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { useHaptics } from '@/hooks/useHaptics';
import { useCelebration } from '@/hooks/useCelebration';
import { useState } from 'react';

interface PaywallSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  {
    icon: HeartPulse,
    title: 'Allergen Protocol',
    description: 'Track all 9 major allergens safely',
  },
  {
    icon: CalendarClock,
    title: 'Smart Reminders',
    description: 'Stay on schedule with weekly nudges',
  },
  {
    icon: ScrollText,
    title: 'Doctor Reports',
    description: 'Professional PDFs for pediatrician visits',
  },
  {
    icon: Infinity,
    title: 'Unlimited Tracking',
    description: 'Log every food with no restrictions',
  },
];

export function PaywallSheet({ isOpen, onClose }: PaywallSheetProps) {
  const { packages, purchasePackage, restorePurchases, isLoading } = useSubscription();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();
  const { medium, success } = useHaptics();
  const { celebrate } = useCelebration();

  const monthlyPackage = packages.find(pkg => 
    pkg.packageType === 'MONTHLY' || pkg.identifier === '$rc_monthly'
  );

  const handlePurchase = async () => {
    if (!monthlyPackage) {
      toast({
        title: 'Subscription unavailable',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return;
    }

    medium();
    setIsPurchasing(true);
    
    try {
      const purchased = await purchasePackage(monthlyPackage);
      if (purchased) {
        success();
        celebrate('premium');
        toast({
          title: 'Welcome to Premium!',
          description: 'You now have full access to the Allergen Protocol',
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Purchase failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    medium();
    setIsRestoring(true);
    
    try {
      const restored = await restorePurchases();
      if (restored) {
        success();
        toast({
          title: 'Purchases restored!',
          description: 'Your premium access has been restored',
        });
        onClose();
      } else {
        toast({
          title: 'No purchases found',
          description: 'No previous purchases were found for this account',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Restore failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const price = monthlyPackage?.product.priceString || '$4.99';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-card rounded-t-3xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-4 h-4 text-primary-foreground" />
          </button>

          {/* Header with Premium Gradient */}
          <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 pt-10 pb-8 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            {/* Premium Badge with Star */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1, damping: 12 }}
              className="relative inline-flex items-center justify-center w-16 h-16 mb-4"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-16 h-16 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Unlock Everything
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-sm"
            >
              Get full access to all premium features
            </motion.p>
          </div>

          {/* Features List */}
          <div className="px-6 py-5">
            <div className="space-y-3">
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="px-6 pb-6">
            {/* Price Display with Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-center mb-4"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Best Value</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-foreground">{price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </motion.div>

            {/* Subscribe Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || isLoading}
                className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-90 transition-opacity border-0 gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                {isPurchasing ? (
                  <span className="animate-pulse relative z-10">Processing...</span>
                ) : (
                  <>
                    <Star className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">Upgrade to Premium</span>
                  </>
                )}
              </Button>
            </motion.div>

            {/* Restore Purchases */}
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center mt-4 safe-area-bottom">
              Recurring billing. Cancel anytime in Settings.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
