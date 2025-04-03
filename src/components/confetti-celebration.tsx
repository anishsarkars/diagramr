
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  duration = 2000, 
  particleCount = 50,
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
      
      // Reduced intensity
      const intensity = 0.7 - Math.min(0.7, elapsed / duration);
      
      // Main burst - more subtle
      confetti({
        particleCount: Math.floor(particleCount * intensity * 0.6),
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FF5757', '#5271FF', '#F18F01', '#00BD9D', '#A148FF'],
        gravity: 0.8, // Higher gravity for quicker fall
        scalar: 0.7, // Smaller particles
        drift: 0.5, // Less drift
        ticks: 100 // Fewer ticks = shorter particle lifetime
      });
      
      // Side bursts (less frequent and more subtle)
      if (Math.random() < 0.2 * intensity) {
        confetti({
          particleCount: Math.floor(particleCount * 0.2 * intensity),
          angle: 60,
          spread: 40,
          origin: { x: 0.1, y: 0.5 },
          gravity: 0.8,
          scalar: 0.6
        });
      }
      
      // Schedule next frame with longer interval for fewer particles
      const frameId = setTimeout(() => {
        requestAnimationFrame(launchConfetti);
      }, 150);
      
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
