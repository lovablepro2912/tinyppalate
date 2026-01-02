import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Purchases, CustomerInfo, PurchasesPackage, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  isPremium: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  expiresAt: Date | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const REVENUECAT_API_KEY = 'appl_YOUR_REVENUECAT_IOS_API_KEY'; // Replace with actual key from RevenueCat dashboard
const PREMIUM_ENTITLEMENT = 'premium';

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const checkEntitlements = useCallback(async (customerInfo: CustomerInfo) => {
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
    const hasPremium = !!premiumEntitlement;
    
    setIsPremium(hasPremium);
    
    if (premiumEntitlement?.expirationDate) {
      setExpiresAt(new Date(premiumEntitlement.expirationDate));
    } else {
      setExpiresAt(null);
    }

    // Sync to database
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          await supabase
            .from('subscriptions')
            .update({
              entitlement_active: hasPremium,
              expires_at: premiumEntitlement?.expirationDate || null,
              product_id: premiumEntitlement?.productIdentifier || null,
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              entitlement_active: hasPremium,
              expires_at: premiumEntitlement?.expirationDate || null,
              product_id: premiumEntitlement?.productIdentifier || null,
            });
        }
      } catch (error) {
        console.error('Error syncing subscription to database:', error);
      }
    }
  }, [user]);

  const initializePurchases = useCallback(async () => {
    if (!isNative) {
      // On web, check database for subscription status
      if (user) {
        try {
          const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            const isActive = data.entitlement_active && 
              (!data.expires_at || new Date(data.expires_at) > new Date());
            setIsPremium(isActive);
            if (data.expires_at) {
              setExpiresAt(new Date(data.expires_at));
            }
          }
        } catch (error) {
          console.log('No subscription found for user');
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: user?.id,
      });

      // Get customer info
      const { customerInfo } = await Purchases.getCustomerInfo();
      await checkEntitlements(customerInfo);

      // Get available packages
      try {
        const offeringsResult = await Purchases.getOfferings();
        const current = offeringsResult.current;
        if (current?.availablePackages) {
          setPackages(current.availablePackages);
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
      }

      // Listen for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        checkEntitlements(info);
      });

    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isNative, user, checkEntitlements]);

  useEffect(() => {
    if (user) {
      initializePurchases();
    } else {
      setIsPremium(false);
      setIsLoading(false);
      setPackages([]);
    }
  }, [user, initializePurchases]);

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!isNative) {
      console.log('Purchases not available on web');
      return false;
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      await checkEntitlements(customerInfo);
      return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
        return false;
      }
      console.error('Purchase error:', error);
      throw error;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!isNative) {
      console.log('Restore not available on web');
      return false;
    }

    try {
      const { customerInfo } = await Purchases.restorePurchases();
      await checkEntitlements(customerInfo);
      return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      isLoading,
      packages,
      purchasePackage,
      restorePurchases,
      expiresAt,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
