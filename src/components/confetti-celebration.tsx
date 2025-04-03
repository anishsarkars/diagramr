
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface ConfettiCelebrationProps {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
  intensity?: "low" | "medium" | "high";
}

export function ConfettiCelebration({
  duration = 3000,
  particleCount = 100,
  intensity = "medium",
  onComplete,
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    // Calculate intensity-based parameters
    let spread = 70;
    let startVelocity = 30;
    let decay = 0.9;
    let gravity = 1;

    switch (intensity) {
      case "low":
        particleCount = Math.max(50, particleCount);
        spread = 50;
        break;
      case "high":
        particleCount = Math.max(150, particleCount);
        spread = 100;
        startVelocity = 45;
        decay = 0.92;
        gravity = 0.8;
        break;
      default: // medium
        particleCount = Math.max(100, particleCount);
    }

    // Create a more dramatic confetti effect
    const makeConfetti = () => {
      confetti({
        particleCount,
        spread,
        origin: { y: 0.5 },
        colors: ['#FF5252', '#FFD740', '#40C4FF', '#69F0AE', '#E040FB'],
        startVelocity,
        decay,
        gravity,
        ticks: 200,
        shapes: ['square', 'circle'],
        scalar: 1.2,
        zIndex: 1000,
      });
    };

    // Fire multiple confetti bursts for a more dramatic effect
    makeConfetti();
    
    const interval = setInterval(() => {
      makeConfetti();
    }, 650);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isActive, duration, particleCount, intensity, onComplete]);

  return null;
}
