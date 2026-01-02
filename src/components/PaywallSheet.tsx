import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, ShieldCheck, FileText, Bell, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { useHaptics } from '@/hooks/useHaptics';

interface PaywallSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Allergen Protocol',
    description: 'Track all 9 major allergens with our guided introduction protocol',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Get reminded to maintain allergen exposures 2-3x per week',
  },
  {
    icon: FileText,
    title: 'Doctor Reports',
    description: 'Generate professional PDF reports for pediatrician visits',
  },
];

export function PaywallSheet({ isOpen, onClose }: PaywallSheetProps) {
  const { packages, purchasePackage, restorePurchases, isLoading } = useSubscription();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();
  const { medium, success } = useHaptics();

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
        toast({
          title: 'Welcome to Premium! 🎉',
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
          title: 'Purchases restored! 🎉',
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

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
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
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Header with Gradient */}
          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 px-6 pt-8 pb-6 text-center">
            {/* Premium Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4"
            >
              <Crown className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-bold text-primary-foreground">PREMIUM MEMBERSHIP</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-primary-foreground mb-2"
            >
              Unlock the Allergen Protocol
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/80 text-sm"
            >
              Safely introduce the Top 9 allergens with our guided protocol
            </motion.p>
          </div>

          {/* Feature Carousel */}
          <div className="px-6 py-6">
            <div className="relative">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-secondary/50 rounded-2xl p-5 text-center min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {(() => {
                    const Icon = FEATURES[currentFeature].icon;
                    return <Icon className="w-7 h-7 text-primary" />;
                  })()}
                </div>
                <h3 className="font-bold text-foreground mb-1">
                  {FEATURES[currentFeature].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {FEATURES[currentFeature].description}
                </p>
              </motion.div>

              {/* Navigation Arrows */}
              <button
                onClick={prevFeature}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full bg-card card-shadow flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={nextFeature}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full bg-card card-shadow flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-4">
              {FEATURES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentFeature(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentFeature ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="px-6 pb-6">
            {/* Price Display */}
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-foreground">{price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            {/* Subscribe Button */}
            <Button
              onClick={handlePurchase}
              disabled={isPurchasing || isLoading}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 gap-2"
            >
              {isPurchasing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Upgrade to Premium
                </>
              )}
            </Button>

            {/* Restore Purchases */}
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Recurring billing. Cancel anytime in Settings.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
