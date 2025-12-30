import { useState, useEffect } from 'react';

const CACHE_KEY = 'userCountryCode';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedLocation {
  countryCode: string;
  timestamp: number;
}

export function useUserLocation() {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CachedLocation = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            setCountryCode(parsed.countryCode);
            setIsLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // Fetch location from IP
      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          const code = data.country_code || 'US';
          
          // Cache the result
          const cacheData: CachedLocation = {
            countryCode: code,
            timestamp: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          
          setCountryCode(code);
        } else {
          setCountryCode('US');
        }
      } catch {
        // Fallback to US on error
        setCountryCode('US');
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { countryCode, isLoading };
}
