
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CreditCard, HelpCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-lg py-16 mx-auto px-4">
      <Card className="shadow-lg border-border/40">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-xl font-semibold">Payment Cancelled</CardTitle>
          </div>
          <CardDescription className="text-base">
            Your premium subscription payment was cancelled. No charges have been made to your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you experienced any issues during checkout or have questions about our premium plans, please don't hesitate to contact our support team.
          </p>
          
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <h4 className="font-medium mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Having trouble?
            </h4>
            <ul className="space-y-1 ml-6 list-disc text-muted-foreground">
              <li>Check your payment method details</li>
              <li>Ensure you have sufficient funds available</li>
              <li>Try a different payment method</li>
              <li>Contact your bank if payments are being declined</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
          
          <Button 
            className="w-full sm:w-auto" 
            onClick={() => navigate("/pricing")}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
