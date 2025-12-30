import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index < currentStep
              ? 'bg-primary w-2'
              : index === currentStep
              ? 'bg-primary w-6'
              : 'bg-muted w-2'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: index === currentStep ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
}
