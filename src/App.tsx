import { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PWAPrompt } from "@/components/PWAPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SplashScreen } from "@/components/SplashScreen";
import { Button } from "@/components/ui/button";
import { Apple, Smartphone } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Check if running on native platform
const isNativePlatform = Capacitor.isNativePlatform();

// Download App page for web visitors
function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto space-y-8">
        {/* App Icon */}
        <div className="w-24 h-24 mx-auto bg-primary rounded-3xl flex items-center justify-center shadow-lg">
          <span className="text-5xl">🍼</span>
        </div>
        
        {/* App Name & Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">TinyPalate</h1>
          <p className="text-lg text-muted-foreground">
            Track your baby's food journey with confidence
          </p>
        </div>
        
        {/* Download Message */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <p className="text-foreground font-medium mb-4">
            TinyPalate is available on iOS and Android
          </p>
          <p className="text-sm text-muted-foreground">
            Download the app to start tracking allergens, logging meals, and monitoring your baby's food introductions.
          </p>
        </div>
        
        {/* Store Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => window.open('https://apps.apple.com/app/tinypalate', '_blank')}
          >
            <Apple className="h-5 w-5" />
            App Store
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => window.open('https://play.google.com/store/apps/details?id=app.tinypalate', '_blank')}
          >
            <Smartphone className="h-5 w-5" />
            Google Play
          </Button>
        </div>
        
        {/* Legal Links */}
        <div className="flex gap-4 justify-center text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

// Onboarding route wrapper
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!needsOnboarding) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Auth route wrapper (redirects to home if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Web blocker wrapper - blocks web access to app routes
function NativeOnlyRoute({ children }: { children: React.ReactNode }) {
  if (!isNativePlatform) {
    return <DownloadAppPage />;
  }
  return <>{children}</>;
}

// App routes component - must be inside AuthProvider
function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={
        <NativeOnlyRoute>
          <AuthRoute>
            <Auth />
          </AuthRoute>
        </NativeOnlyRoute>
      } />
      <Route path="/onboarding" element={
        <NativeOnlyRoute>
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        </NativeOnlyRoute>
      } />
      <Route path="/" element={
        <NativeOnlyRoute>
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        </NativeOnlyRoute>
      } />
      {/* Legal pages remain accessible on web for App Store compliance */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={
        isNativePlatform ? <NotFound /> : <DownloadAppPage />
      } />
    </Routes>
  );
}

function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(isNativePlatform);

  useEffect(() => {
    if (!isNativePlatform) return;
    
    // Hide splash after 1.5 seconds on native
    const timer = setTimeout(() => {
      setShowSplash(false);
      CapacitorSplashScreen.hide();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isNativePlatform && <SplashScreen isVisible={showSplash} />}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {isNativePlatform && <OfflineIndicator />}
          {isNativePlatform && <PWAPrompt />}
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

const App = () => <AppWithSplash />;

export default App;
