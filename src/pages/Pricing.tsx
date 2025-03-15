
import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [yearlyBilling, setYearlyBilling] = useState(false);
  
  const handleSubscribe = (plan: "monthly" | "lifetime") => {
    if (!user) {
      toast.info("Please sign in to subscribe");
      navigate("/auth", { state: { returnUrl: "/pricing" } });
      return;
    }
    
    // In a real app, you would redirect to your payment processor
    // For now we just open the external payment links
  };
  
  const features = [
    { name: "Searches per day", free: "3", premium: "Unlimited" },
    { name: "High-quality diagrams", free: "✓", premium: "✓" },
    { name: "AI-generated diagrams", free: "✗", premium: "✓" },
    { name: "Save favorites", free: "✗", premium: "✓" },
    { name: "Export diagrams", free: "✗", premium: "✓" },
    { name: "Study mode", free: "✗", premium: "✓" },
    { name: "Priority support", free: "✗", premium: "✓" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container py-16 px-4">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for you and start discovering and learning from diagrams today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 my-8">
            {/* Free Plan */}
            <motion.div 
              className="border border-border rounded-xl p-6 bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="text-center pb-4 border-b border-border mb-6">
                <h2 className="text-lg font-medium mb-1">Free</h2>
                <p className="text-3xl font-bold">₹0<span className="text-muted-foreground text-base font-normal">/forever</span></p>
                <p className="text-sm text-muted-foreground mt-2">Perfect for casual users</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-2 text-sm">
                    <span className={feature.free === "✓" ? "text-green-500" : 
                                    feature.free === "✗" ? "text-muted-foreground" : ""}>
                      {feature.free}
                    </span>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/")}
              >
                Get Started
              </Button>
            </motion.div>
            
            {/* Premium Plan */}
            <motion.div 
              className="border-2 border-primary rounded-xl p-6 bg-card relative overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute -right-12 top-6 bg-primary text-primary-foreground py-1 px-10 rotate-45">
                Popular
              </div>
              
              <div className="text-center pb-4 border-b border-border mb-6">
                <h2 className="text-lg font-medium mb-1">Premium</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-3xl font-bold">₹299<span className="text-muted-foreground text-base font-normal">/month</span></p>
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">₹899<span className="text-muted-foreground text-base font-normal">/lifetime</span></p>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">{feature.premium}</span>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-3">
                <Button 
                  asChild
                  variant="default" 
                  className="w-full gap-1.5"
                >
                  <a 
                    href="https://rzp.io/rzp/KYo2irKm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>Monthly (₹299)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
                
                <Button 
                  asChild
                  variant="secondary" 
                  className="w-full gap-1.5"
                >
                  <a 
                    href="https://rzp.io/rzp/PO66xQq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>Lifetime (₹899)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-8 mt-12">
            <h3 className="text-xl font-medium mb-4">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">What's included in the free plan?</h4>
                <p className="text-sm text-muted-foreground">The free plan includes 3 searches per day and access to high-quality diagram results.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Can I upgrade anytime?</h4>
                <p className="text-sm text-muted-foreground">Yes, you can upgrade to Premium at any time to unlock all features.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">We accept all major credit cards, UPI, and net banking through our payment processor.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">How does the lifetime plan work?</h4>
                <p className="text-sm text-muted-foreground">The lifetime plan is a one-time payment that gives you unlimited access to all premium features forever.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
