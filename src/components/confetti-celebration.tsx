import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  duration?: number;
  particleCount?: number;
  spread?: number;
  gravity?: number;
  colors?: string[];
  recycle?: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  duration = 3000, 
  particleCount = 200,
  spread = 70,
  gravity = 1.0,
  colors = [
    '#FF8A8A', '#8AAFFF', '#FFB066', '#66DDBD', '#C685FF', 
    '#FFE066', '#A6E6FF', '#FF9ED2'
  ],
  recycle = false,
  onComplete 
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(true);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!isActive) return;

    const cleanupFunctions: Array<() => void> = [];
    cleanupFunctionsRef.current = cleanupFunctions;
    
    // Create a subtle confetti burst
    const fireConfettiBurst = () => {
      // Create a canvas confetti instance with custom settings
      const myConfetti = confetti.create(undefined, { 
        resize: true,
        useWorker: true
      });
      
      // First burst - from top center
      myConfetti({
        particleCount: Math.min(particleCount, 200),
        spread: spread,
        origin: { y: 0.2, x: 0.5 },
        colors: colors,
        startVelocity: 30,
        gravity: gravity,
        ticks: 180,
        scalar: 0.8,
        shapes: ['circle', 'square'],
        drift: 0.5,
        disableForReducedMotion: true,
        zIndex: 1000,
        decay: 0.92,
      });
      
      // Second burst - delayed for a staggered effect
      const secondBurstTimer = setTimeout(() => {
        if (isActive) {
          myConfetti({
            particleCount: Math.min(particleCount / 2, 150),
            spread: spread * 0.8,
            origin: { y: 0.3, x: 0.6 },
            colors: colors,
            startVelocity: 25,
            gravity: gravity * 0.9,
            ticks: 150,
            scalar: 0.7,
            shapes: ['circle', 'square'],
            drift: 0.3,
            disableForReducedMotion: true,
            zIndex: 1000,
            decay: 0.9,
          });
        }
      }, 200);
      
      cleanupFunctions.push(() => clearTimeout(secondBurstTimer));
      
      // Third burst - from left side for more coverage
      const thirdBurstTimer = setTimeout(() => {
        if (isActive) {
          myConfetti({
            particleCount: Math.min(particleCount / 2, 100),
            spread: spread * 0.7,
            origin: { y: 0.35, x: 0.4 },
            colors: colors,
            startVelocity: 28,
            gravity: gravity * 0.85,
            ticks: 160,
            scalar: 0.75,
            shapes: ['circle', 'square'],
            drift: 0.4,
            disableForReducedMotion: true,
            zIndex: 1000,
            decay: 0.91,
          });
        }
      }, 400);
      
      cleanupFunctions.push(() => clearTimeout(thirdBurstTimer));
      
      // If recycle is true, schedule more bursts
      if (recycle && isActive) {
        const recycleTimer = setTimeout(() => {
          if (isActive) fireConfettiBurst();
        }, 800);
        
        cleanupFunctions.push(() => clearTimeout(recycleTimer));
      }
    };
    
    // Start the confetti with a slight delay to ensure DOM is ready
    const initialDelayTimer = setTimeout(() => {
      if (isActive) fireConfettiBurst();
    }, 100);
    
    cleanupFunctions.push(() => clearTimeout(initialDelayTimer));
    
    // Set the completion timer
    const completionTimer = setTimeout(() => {
      setIsActive(false);
      if (onComplete) onComplete();
    }, duration);
    
    cleanupFunctions.push(() => clearTimeout(completionTimer));
    
    // Cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
    
  }, [duration, particleCount, spread, gravity, colors, recycle, isActive, onComplete]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  return null;
}
