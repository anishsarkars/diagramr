
import { useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { useAccess } from "@/components/access-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PaymentWebhookHandler() {
  const { user, refreshProfile } = useAuth();
  const { setPremiumUser } = useAccess();

  useEffect(() => {
    // Listen for webhook events from DodoPayments
    const handleWebhookMessage = async (event: MessageEvent) => {
      // Validate the origin (in production, this should be restricted)
      if (event.origin !== window.location.origin) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Check if it's a payment webhook event
        if (data?.type !== 'payment_webhook') return;
        
        console.log('Payment webhook received:', data);
        
        if (data.status === 'success' && user) {
          // Update the user's profile to premium
          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
          
          if (error) {
            console.error('Error updating premium status:', error);
            return;
          }
          
          // Update local state
          setPremiumUser(true);
          
          // Refresh user profile
          await refreshProfile();
          
          toast.success('Payment processed successfully!', {
            description: 'Your account has been upgraded to Premium.'
          });
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
      }
    };
    
    // Add event listener for webhook messages
    window.addEventListener('message', handleWebhookMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleWebhookMessage);
    };
  }, [user, setPremiumUser, refreshProfile]);
  
  // This component doesn't render anything, it just listens for events
  return null;
}
