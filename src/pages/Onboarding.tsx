import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { StepBabyInfo } from '@/components/onboarding/StepBabyInfo';
import { StepWelcome } from '@/components/onboarding/StepWelcome';
import { StepLogging } from '@/components/onboarding/StepLogging';
import { StepSafety } from '@/components/onboarding/StepSafety';
import { StepAllergen } from '@/components/onboarding/StepAllergen';
import { StepComplete } from '@/components/onboarding/StepComplete';

const TOTAL_STEPS = 6;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signOut, checkOnboardingStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateStep = () => {
    if (step === 0) {
      if (!babyName.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your baby's name",
          variant: "destructive",
        });
        return false;
      }
      if (!birthDate) {
        toast({
          title: "Date of birth required",
          description: "Please enter your baby's date of birth",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          baby_name: babyName.trim(),
          birth_date: birthDate,
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: `Welcome, ${babyName}! 🎉`,
        description: "Let's start your food adventure!",
      });
      
      await checkOnboardingStatus();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!babyName.trim() || !birthDate) {
      toast({
        title: "Baby info required",
        description: "Please complete the first step before skipping",
        variant: "destructive",
      });
      setStep(0);
      return;
    }
    await handleComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepBabyInfo babyName={babyName} setBabyName={setBabyName} birthDate={birthDate} setBirthDate={setBirthDate} />;
      case 1:
        return <StepWelcome babyName={babyName} />;
      case 2:
        return <StepLogging />;
      case 3:
        return <StepSafety />;
      case 4:
        return <StepAllergen />;
      case 5:
        return <StepComplete babyName={babyName} />;
      default:
        return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-primary/10 flex items-center justify-center p-4 safe-area-all">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-6 card-shadow border border-border/50">
          {/* Progress */}
          <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}

            {isLastStep ? (
              <Button
                onClick={handleComplete}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Start Journey <Sparkles className="w-4 h-4" />
                  </span>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Skip option */}
          {step > 0 && !isLastStep && (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              Skip guide and start now
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Track 100 foods before age 1 🥕🍎🥦
          </p>
          <button
            type="button"
            onClick={signOut}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
          >
            <LogOut className="w-3 h-3" />
            Use a different account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
