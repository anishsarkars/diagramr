
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { toast } from "sonner";
import { useAccess } from "@/components/access-context";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Calendar, Clock, CreditCard, Sparkles, Unlock, HeartHandshake, Star, Search } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");
  
  const { user, profile, refreshProfile } = useAuth();
  const { setPremiumUser } = useAccess();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    planName: "Premium Plan",
    amount: "$9.99",
    date: new Date(),
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    paymentId: "",
    reference: ""
  });
  
  // Verify the payment and update user status
  useEffect(() => {
    const verifyPayment = async () => {
      if (!status || status !== "success") {
        setLoading(false);
        return;
      }
      
      try {
        // Wait a moment to ensure session is fully loaded
        if (!user) {
          console.log("Waiting for user session to load...");
          setTimeout(() => verifyPayment(), 1000);
          return;
        }
        
        console.log("Verifying payment:", { paymentId, status, reference, userId: user.id });
        
        // Update payment details
        setPaymentDetails(prev => ({
          ...prev,
          paymentId: paymentId || "Unknown",
          reference: reference || "Unknown"
        }));

        // Directly update the user's premium status in Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', user.id);
          
        if (updateError) {
          console.error("Error updating premium status:", updateError);
          toast.error("Failed to update premium status", {
            description: "Please try refreshing or contact support."
          });
        } else {
          console.log("Successfully updated premium status in database");
          // Update local context state
          setPremiumUser(true);
          
          // Refresh user profile to get updated premium status
          await refreshProfile();
          
          // Show confetti
          setShowConfetti(true);
          
          // Show success toast
          toast.success("Payment processed successfully!", {
            description: "Your account has been upgraded to Premium."
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Error verifying payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };
    
    // Start verification process
    verifyPayment();
  }, [paymentId, status, reference, user, setPremiumUser, refreshProfile]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-primary font-medium">Verifying your payment...</p>
        </div>
      </div>
    );
  }
  
  if (!status || status !== "success") {
    return (
      <div className="container max-w-lg py-16 mx-auto px-4">
        <Card className="shadow-lg border-border/40">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Payment Verification Failed</CardTitle>
            <CardDescription>
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      {showConfetti && <ConfettiCelebration duration={5000} />}
      
      <div className="container max-w-3xl pt-10 pb-20 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2" />
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    You're now Premium, {profile?.username || user?.email?.split('@')[0] || 'User'}! 🚀
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Thank you for upgrading. Enjoy your enhanced experience!
                  </CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className="ml-1 py-1 px-2.5 text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 text-white"
                >
                  PREMIUM
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Your Premium Benefits
                  </h3>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Unlimited diagram searches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>AI-powered results with improved accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Save unlimited diagrams to your library</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Access to premium diagram templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="space-y-4 border-t pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Payment Details
                  </h3>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Plan:</div>
                    <div className="font-medium">{paymentDetails.planName}</div>
                    
                    <div className="text-muted-foreground">Amount:</div>
                    <div className="font-medium">{paymentDetails.amount} / month</div>
                    
                    <div className="text-muted-foreground flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Purchase date:
                    </div>
                    <div>{format(paymentDetails.date, 'PPP')}</div>
                    
                    <div className="text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Next renewal:
                    </div>
                    <div>{format(paymentDetails.renewalDate, 'PPP')}</div>
                    
                    <div className="text-muted-foreground">Payment ID:</div>
                    <div className="text-xs font-mono">{paymentDetails.paymentId}</div>
                    
                    <div className="text-muted-foreground">Reference:</div>
                    <div className="text-xs font-mono">{paymentDetails.reference}</div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-8 pt-6 border-t border-border/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-primary" />
                  Start Exploring Premium Features
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    className="h-auto py-6 flex flex-col gap-2 items-center justify-center"
                  >
                    <Search className="h-5 w-5 mb-1" />
                    <span>Start Exploring</span>
                    <ChevronRight className="h-4 w-4 mt-1" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/liked")} 
                    className="h-auto py-6 flex flex-col gap-2 items-center justify-center"
                  >
                    <HeartHandshake className="h-5 w-5 mb-1" />
                    <span>View Saved Diagrams</span>
                    <ChevronRight className="h-4 w-4 mt-1" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/account")} 
                    className="h-auto py-6 flex flex-col gap-2 items-center justify-center"
                  >
                    <Star className="h-5 w-5 mb-1" />
                    <span>Manage Account</span>
                    <ChevronRight className="h-4 w-4 mt-1" />
                  </Button>
                </div>
              </motion.div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t pt-4 mt-4">
              <Button variant="ghost" onClick={() => navigate("/")}>Return to Home</Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
