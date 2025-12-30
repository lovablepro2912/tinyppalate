import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground fab-shadow flex items-center justify-center touch-target no-select active:brightness-90 safe-area-right"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Camera className="w-7 h-7" />
    </motion.button>
  );
}
