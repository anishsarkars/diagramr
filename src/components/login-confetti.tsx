import { useState, useEffect } from "react";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { useAuth } from "@/components/auth-context";

export function LoginConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { isNewLogin, setIsNewLogin } = useAuth();

  useEffect(() => {
    // Prevent showing confetti on page refresh by checking local storage
    const shouldShowConfetti = () => {
      if (!isNewLogin) return false;
      
      const lastLoginTime = localStorage.getItem('last_login_time');
      if (!lastLoginTime) return true;
      
      // Only show confetti if this is a genuine new login (not a page refresh)
      // and not if we've shown it in the last 10 seconds
      const timeSinceLastLogin = Date.now() - parseInt(lastLoginTime);
      return timeSinceLastLogin > 10000; // 10 seconds
    };
    
    // Check if user is logging in or signing up
    if (isNewLogin && shouldShowConfetti()) {
      console.log("Login detected! Showing confetti celebration");
      
      // Show confetti with a slight delay for better UX
      setTimeout(() => {
        setShowConfetti(true);
      }, 400);
      
      // Reset the flag only after confetti has been triggered
      setIsNewLogin(false);
    }
  }, [isNewLogin, setIsNewLogin]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {showConfetti && (
        <ConfettiCelebration 
          particleCount={100}
          duration={2500}
          spread={50}
          gravity={0.35}
          colors={["#8b5cf6", "#3b82f6", "#ec4899", "#06b6d4", "#10b981"]}
          onComplete={() => setShowConfetti(false)}
        />
      )}
    </div>
  );
} 