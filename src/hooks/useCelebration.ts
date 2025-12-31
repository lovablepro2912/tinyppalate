import { useCallback } from 'react';
import confetti from 'canvas-confetti';

type CelebrationType = 'foodSafe' | 'groupComplete' | 'allComplete' | 'milestone';

export function useCelebration() {
  const celebrate = useCallback((type: CelebrationType) => {
    switch (type) {
      case 'foodSafe':
        // Small burst for individual food marked safe
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#86efac', '#4ade80'],
        });
        break;

      case 'groupComplete':
        // Medium celebration for completing an allergen group
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#22c55e', '#f59e0b', '#3b82f6'],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#22c55e', '#f59e0b', '#3b82f6'],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        break;

      case 'allComplete':
        // Epic celebration for completing ALL allergens
        const epicDuration = 4000;
        const epicEnd = Date.now() + epicDuration;
        
        // Initial big burst
        confetti({
          particleCount: 150,
          spread: 180,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        });

        // Continuous side bursts
        const epicFrame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 80,
            origin: { x: 0, y: 0.5 },
            colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 80,
            origin: { x: 1, y: 0.5 },
            colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
          });

          if (Date.now() < epicEnd) {
            requestAnimationFrame(epicFrame);
          }
        };
        epicFrame();

        // Fireworks effect
        setTimeout(() => {
          confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: { x: 0.5, y: 0.3 },
            colors: ['#22c55e', '#f59e0b', '#3b82f6'],
          });
        }, 500);
        setTimeout(() => {
          confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: { x: 0.3, y: 0.4 },
            colors: ['#ec4899', '#8b5cf6', '#22c55e'],
          });
        }, 1000);
        setTimeout(() => {
          confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: { x: 0.7, y: 0.4 },
            colors: ['#f59e0b', '#3b82f6', '#ec4899'],
          });
        }, 1500);
        break;

      case 'milestone':
        // Celebration for milestones (10, 25, 50, etc. foods tried)
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
        });
        break;
    }
  }, []);

  return { celebrate };
}
