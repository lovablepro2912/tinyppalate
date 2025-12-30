import { Phone } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getPoisonControlInfo } from '@/data/poisonControlNumbers';
import { Skeleton } from '@/components/ui/skeleton';

interface PoisonControlBannerProps {
  variant?: 'default' | 'compact';
}

export function PoisonControlBanner({ variant = 'default' }: PoisonControlBannerProps) {
  const { countryCode, isLoading } = useUserLocation();
  const info = getPoisonControlInfo(countryCode || 'US');

  const phoneNumber = info.number.replace(/[^+\d]/g, '');

  if (isLoading) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={`tel:${phoneNumber}`}
        className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 hover:bg-red-500/20 transition-colors"
      >
        <Phone className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
          {info.flag} {info.number}
        </span>
      </a>
    );
  }

  return (
    <a
      href={`tel:${phoneNumber}`}
      className="block bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center hover:bg-red-500/20 transition-colors"
    >
      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
        🚨 {info.flag} Poison Control: {info.number}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {info.name} • Tap to call
      </p>
    </a>
  );
}
