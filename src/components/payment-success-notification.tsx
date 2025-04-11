
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useAccess } from "@/components/access-context";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

export function PaymentSuccessNotification() {
  const { user, refreshProfile } = useAuth();
  const { setPremiumUser } = useAccess();
  const navigate = useNavigate();
  const [processed, setProcessed] = useState(false);

  // Process payment success URL parameters
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (processed) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const paymentReference = urlParams.get('payment_reference');
      
      if (paymentStatus === 'success' && paymentReference && user) {
        setProcessed(true);
        
        try {
          // Here we would call a Supabase function to verify the payment
          // But for now, we'll simulate a successful verification
          console.log(`Verifying payment with reference: ${paymentReference}`);
          
          // Show confetti celebration
          const duration = 3 * 1000;
          const end = Date.now() + duration;
          
          // Launch confetti
          function frame() {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#FF4500', '#0066FF', '#FFD700']
            });
            
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#FF4500', '#0066FF', '#FFD700']
            });
            
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }
          
          frame();
          
          // Update user's premium status in the local access context
          setPremiumUser(true);
          
          // Show success toast
          toast.success("Payment successful!", {
            description: "Your account has been upgraded to Premium.",
            duration: 5000,
          });
          
          // Refresh profile to get updated premium status
          await refreshProfile();
          
          // Clear the URL parameters
          const cleanUrl = window.location.pathname;
          navigate(cleanUrl, { replace: true });
        } catch (error) {
          console.error("Error processing payment:", error);
          toast.error("Error verifying payment", {
            description: "Please contact support if premium features are not available.",
          });
        }
      }
    };
    
    if (user) {
      handlePaymentSuccess();
    }
  }, [user, processed, setPremiumUser, navigate, refreshProfile]);
  
  return null; // This component doesn't render anything
}
