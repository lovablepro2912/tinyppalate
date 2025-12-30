import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from './OnboardingProgress';
import { StepWelcome } from './StepWelcome';
import { StepLogging } from './StepLogging';
import { StepSafety } from './StepSafety';
import { StepAllergen } from './StepAllergen';

interface OnboardingGuideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  babyName: string;
}

const TOTAL_STEPS = 4;

export function OnboardingGuideSheet({ open, onOpenChange, babyName }: OnboardingGuideSheetProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      setStep(0);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(0);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepWelcome babyName={babyName} />;
      case 1:
        return <StepLogging />;
      case 2:
        return <StepSafety />;
      case 3:
        return <StepAllergen />;
      default:
        return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-4 pb-6">
        <SheetHeader>
          <SheetTitle className="text-center">App Guide</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

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

            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80"
            >
              {isLastStep ? 'Done' : 'Next'} 
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
