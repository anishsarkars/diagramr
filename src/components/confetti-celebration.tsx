
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface ConfettiCelebrationProps {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
  intensity?: "low" | "medium" | "high";
}

export function ConfettiCelebration({
  duration = 2000,
  particleCount = 50,
  intensity = "low",
  onComplete,
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    // Calculate intensity-based parameters (more subtle now)
    let spread = 50;
    let startVelocity = 20;
    let decay = 0.9;
    let gravity = 1.2;

    switch (intensity) {
      case "low":
        particleCount = Math.max(30, particleCount);
        spread = 40;
        break;
      case "high":
        particleCount = Math.max(100, particleCount);
        spread = 70;
        startVelocity = 30;
        decay = 0.92;
        gravity = 0.8;
        break;
      default: // medium
        particleCount = Math.max(50, particleCount);
    }

    // Create a more subtle confetti effect
    const makeConfetti = () => {
      confetti({
        particleCount: particleCount / 2,
        spread,
        origin: { y: 0.5 },
        colors: ['#9B87F5', '#7E69AB', '#D6BCFA', '#40C4FF', '#69F0AE'],
        startVelocity,
        decay,
        gravity,
        ticks: 150,
        shapes: ['square', 'circle'],
        scalar: 1,
        zIndex: 1000,
      });
    };

    // Just fire once for minimal effect
    makeConfetti();
    
    const timer = setTimeout(() => {
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isActive, duration, particleCount, intensity, onComplete]);

  return null;
}
