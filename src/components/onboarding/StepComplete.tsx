import { motion } from 'framer-motion';
import { Sparkles, Rocket } from 'lucide-react';

interface StepCompleteProps {
  babyName: string;
}

export function StepComplete({ babyName }: StepCompleteProps) {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        <span className="text-6xl">🚀</span>
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">
          You're all set{babyName ? `, ${babyName}` : ''}!
        </h2>
        <p className="text-muted-foreground mt-2">
          Time to start your food adventure
        </p>
      </div>

      <motion.div
        className="bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="font-semibold text-foreground">Remember</p>
        <p className="text-sm text-muted-foreground mt-1">
          Every new food is a milestone! Celebrate the journey, not just the destination.
        </p>
      </motion.div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Rocket className="w-4 h-4" />
          <span className="text-sm">100 foods await!</span>
        </div>
        <p className="text-xs text-muted-foreground">
          🥕 🍎 🥦 🍗 🧀 🥚 🍌 🥑 🫐
        </p>
      </div>
    </div>
  );
}
