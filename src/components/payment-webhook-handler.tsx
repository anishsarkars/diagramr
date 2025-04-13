
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth-context';
import { useAccess } from '@/components/access-context';
import { toast } from 'sonner';

// This component is used to handle payment webhook responses from payment providers
export function PaymentWebhookHandler() {
  const { user, refreshProfile } = useAuth();
  const { setPremiumUser } = useAccess();

  useEffect(() => {
    // Set up function to process payment webhook events
    const handleWebhookEvent = async (event: MessageEvent) => {
      try {
        // Validate that message is from our payment system
        if (event.origin !== window.location.origin) return;
        
        // Parse the data (expect a payment event object)
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Check if it's a payment event
        if (data?.type !== 'payment_webhook' || !data?.paymentId) return;
        
        console.log('Payment webhook received:', data);
        
        // Process the payment event
        if (data.status === 'success' && user) {
          console.log('Processing successful payment webhook for user:', user.id);
          
          // Update user's premium status in Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
            
          if (error) {
            console.error('Error updating premium status:', error);
            toast.error('Error updating premium status', {
              description: 'Please refresh your profile or contact support.',
            });
            return;
          }
          
          console.log('Successfully updated premium status');
          
          // Update local context
          setPremiumUser(true);
          
          // Refresh user profile
          await refreshProfile();
          
          toast.success('Payment processed successfully!', {
            description: 'Your account has been upgraded to Premium.'
          });
        } else if (data.status === 'failed') {
          toast.error('Payment processing failed', {
            description: 'Please try again or contact support if the issue persists.'
          });
        }
      } catch (error) {
        console.error('Error processing payment webhook:', error);
      }
    };

    // Listen for payment webhook messages
    window.addEventListener('message', handleWebhookEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleWebhookEvent);
    };
  }, [user, setPremiumUser, refreshProfile]);

  return null; // This component doesn't render anything
}
