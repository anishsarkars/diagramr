
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  duration = 1500, 
  particleCount = 30,
  onComplete 
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const animationFrameIds: number[] = [];
    const startTime = Date.now();
    
    // Create more subtle confetti bursts
    const launchConfetti = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed > duration) {
        setIsActive(false);
        if (onComplete) onComplete();
        return;
      }
      
      // Very minimal intensity
      const intensity = 0.5 - Math.min(0.5, elapsed / duration);
      
      // Main burst - very subtle
      confetti({
        particleCount: Math.floor(particleCount * intensity * 0.5),
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#FF5757', '#5271FF', '#F18F01', '#00BD9D', '#A148FF'],
        gravity: 1, // Higher gravity for quicker fall
        scalar: 0.6, // Smaller particles
        drift: 0.3, // Less drift
        ticks: 80 // Fewer ticks = shorter particle lifetime
      });
      
      // Schedule next frame with longer interval for fewer particles
      const frameId = setTimeout(() => {
        requestAnimationFrame(launchConfetti);
      }, 250); // Longer interval between bursts
      
      animationFrameIds.push(frameId as unknown as number);
    };
    
    launchConfetti();
    
    return () => {
      // Cleanup animation frames and timeouts
      animationFrameIds.forEach(id => {
        clearTimeout(id);
        cancelAnimationFrame(id);
      });
    };
  }, [duration, particleCount, isActive, onComplete]);

  return null;
}
