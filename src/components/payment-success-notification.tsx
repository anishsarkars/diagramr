
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useAccess } from "@/components/access-context";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ConfettiCelebration } from "./confetti-celebration";

export function PaymentSuccessNotification() {
  const { user, refreshProfile } = useAuth();
  const { setPremiumUser } = useAccess();
  const navigate = useNavigate();
  const [processed, setProcessed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Process payment success URL parameters
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (processed) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const paymentReference = urlParams.get('payment_reference');
      
      if (paymentStatus === 'success' && paymentReference && user) {
        setProcessed(true);
        setShowConfetti(true);
        
        try {
          console.log(`Verifying payment with reference: ${paymentReference}`);
          
          // Update the user's premium status in Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
          
          if (error) {
            console.error("Error updating premium status:", error);
            toast.error("Error updating premium status", {
              description: "Please contact support if premium features are not available.",
            });
            return;
          }
          
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
  
  return (
    <>
      {showConfetti && (
        <ConfettiCelebration 
          duration={4000}
          onComplete={() => setShowConfetti(false)}
        />
      )}
    </>
  );
}
