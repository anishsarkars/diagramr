import { useEffect, useState, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure onComplete is called after duration
  useEffect(() => {
    if (isActive && onComplete) {
      // Clear any existing timeout
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set a new timeout to ensure onComplete is called
      timerRef.current = setTimeout(() => {
        setIsActive(false);
        onComplete();
      }, duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, duration, onComplete]);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    // Check for mobile device to adjust performance
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const adjustedParticleCount = isMobile ? Math.floor(particleCount * 0.6) : particleCount;
    
    // Create a dedicated confetti instance with our canvas
    const myCanvas = canvasRef.current;
    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true
    });
    
    confettiInstanceRef.current = myConfetti;
    
    const animationFrameIds: number[] = [];
    const startTime = Date.now();
    
    // Use vibrant colors
    const colors = [
      '#FF5757', // red
      '#5271FF', // blue
      '#F18F01', // orange
      '#00BD9D', // teal
      '#A148FF', // purple
      '#FFD700', // gold
      '#00FFFF', // cyan
      '#FF69B4', // hot pink
      '#32CD32', // lime green
      '#FFFFFF'  // white
    ];
    
    // Create confetti bursts
    const launchConfetti = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed > duration) {
        setIsActive(false);
        return;
      }
      
      // Calculate intensity that fades over time
      const intensity = Math.max(0.2, 1 - (elapsed / duration));
      
      // Generate a random burst type for varied effects
      const burstType = Math.floor(Math.random() * 4);
      
      switch (burstType) {
        case 0: // Standard burst from middle bottom
          myConfetti({
            particleCount: Math.floor(adjustedParticleCount * intensity * 0.6),
            spread: 90,
            origin: { y: 0.9, x: 0.5 },
            colors: colors,
            gravity: 0.8,
            scalar: 1.2,
            drift: 0,
            ticks: 200,
            shapes: ['circle', 'square'],
            disableForReducedMotion: true
          });
          break;
          
        case 1: // Side cannon - left
          myConfetti({
            particleCount: Math.floor(adjustedParticleCount * intensity * 0.4),
            angle: 60,
            spread: 50,
            origin: { x: 0, y: 0.7 },
            colors: colors,
            gravity: 1,
            scalar: 1.2,
            drift: 1,
            ticks: 150,
            shapes: ['square', 'circle'],
            disableForReducedMotion: true
          });
          break;
          
        case 2: // Side cannon - right
          myConfetti({
            particleCount: Math.floor(adjustedParticleCount * intensity * 0.4),
            angle: 120,
            spread: 50,
            origin: { x: 1, y: 0.7 },
            colors: colors,
            gravity: 1,
            scalar: 1.2,
            drift: -1,
            ticks: 150,
            shapes: ['circle', 'square'],
            disableForReducedMotion: true
          });
          break;
          
        case 3: // Firework effect from center
          myConfetti({
            particleCount: Math.floor(adjustedParticleCount * intensity * 0.8),
            startVelocity: 30,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: colors,
            gravity: 0.6,
            scalar: 0.9,
            ticks: 180,
            shapes: ['circle'],
            disableForReducedMotion: true
          });
          break;
      }
      
      // Occasionally add special gold burst for emphasis (only on desktop or 25% chance on mobile)
      if (!isMobile || Math.random() < 0.25) {
        setTimeout(() => {
          if (confettiInstanceRef.current) {
            myConfetti({
              particleCount: isMobile ? 15 : 30,
              spread: 100,
              origin: { y: 0.6, x: 0.5 },
              colors: ['#FFD700', '#FFDF00'], // Gold colors
              gravity: 0.5,
              scalar: 1.5, // Larger particles
              ticks: 220,
              disableForReducedMotion: true
            });
          }
        }, 100);
      }
      
      // Schedule next frame with variable interval for natural appearance
      const variance = Math.random() * 150;
      // More performant on mobile
      const baseInterval = isMobile 
        ? (elapsed < duration / 2 ? 280 : 450) 
        : (elapsed < duration / 2 ? 180 : 350);
      const interval = baseInterval + variance;
      
      const frameId = setTimeout(() => {
        if (isActive) {
          requestAnimationFrame(launchConfetti);
        }
      }, interval);
      
      animationFrameIds.push(frameId as unknown as number);
    };
    
    // Initial burst with special pattern
    const createInitialBurst = () => {
      // Center burst
      myConfetti({
        particleCount: adjustedParticleCount,
        spread: 120,
        origin: { y: 0.7, x: 0.5 },
        colors: colors,
        startVelocity: 40,
        gravity: 0.7,
        scalar: 1.2,
        ticks: 250,
        shapes: ['circle', 'square'],
        disableForReducedMotion: true
      });
      
      // Side bursts after a small delay
      setTimeout(() => {
        if (confettiInstanceRef.current) {
          // Left side
          myConfetti({
            particleCount: adjustedParticleCount * 0.5,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.7 },
            colors: colors,
            startVelocity: 30,
            ticks: 200,
            disableForReducedMotion: true
          });
          
          // Right side
          myConfetti({
            particleCount: adjustedParticleCount * 0.5,
            angle: 120, 
            spread: 60,
            origin: { x: 1, y: 0.7 },
            colors: colors,
            startVelocity: 30,
            ticks: 200,
            disableForReducedMotion: true
          });
        }
      }, 250);
    };
    
    // Start with impressive initial burst
    createInitialBurst();
    
    // Then continue with random bursts
    setTimeout(() => {
      launchConfetti();
    }, 500);
    
    return () => {
      // Reset the confetti instance
      if (confettiInstanceRef.current) {
        confettiInstanceRef.current.reset();
      }
      confettiInstanceRef.current = null;
      
      // Cleanup animation frames and timeouts
      animationFrameIds.forEach(id => {
        clearTimeout(id);
        cancelAnimationFrame(id);
      });
    };
  }, [duration, particleCount, isActive]);
  
  // Effect to clean up and hide the canvas when not active
  useEffect(() => {
    if (!isActive && confettiInstanceRef.current) {
      confettiInstanceRef.current.reset();
    }
  }, [isActive]);

  // Return a canvas element that takes the full screen with high z-index
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
