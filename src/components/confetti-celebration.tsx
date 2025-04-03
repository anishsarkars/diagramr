
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  duration = 3000, 
  particleCount = 100,
  onComplete 
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const animationFrameIds: number[] = [];
    const startTime = Date.now();
    
    // Create multiple confetti bursts
    const launchConfetti = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed > duration) {
        setIsActive(false);
        if (onComplete) onComplete();
        return;
      }
      
      // Intensity decreases over time
      const intensity = 1 - Math.min(1, elapsed / duration);
      
      // Main burst
      confetti({
        particleCount: Math.floor(particleCount * intensity),
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5757', '#5271FF', '#F18F01', '#00BD9D', '#A148FF']
      });
      
      // Side bursts (less frequent)
      if (Math.random() < 0.3 * intensity) {
        confetti({
          particleCount: Math.floor(particleCount * 0.3 * intensity),
          angle: 60,
          spread: 50,
          origin: { x: 0, y: 0.6 },
        });
      }
      
      if (Math.random() < 0.3 * intensity) {
        confetti({
          particleCount: Math.floor(particleCount * 0.3 * intensity),
          angle: 120,
          spread: 50,
          origin: { x: 1, y: 0.6 },
        });
      }
      
      // Schedule next frame
      const frameId = requestAnimationFrame(launchConfetti);
      animationFrameIds.push(frameId);
    };
    
    launchConfetti();
    
    return () => {
      // Cleanup animation frames
      animationFrameIds.forEach(id => cancelAnimationFrame(id));
    };
  }, [duration, particleCount, isActive, onComplete]);

  return null;
}
