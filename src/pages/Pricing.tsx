
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Infinity, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Pricing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Direct to payment links
  const redirectToPayment = (url: string) => {
    window.open(url, "_blank");
  };

  // Navigate to auth page if user is not logged in
  const handleUpgradeClick = (paymentUrl: string) => {
    if (!user) {
      navigate("/auth", { state: { returnTo: "/pricing", paymentUrl } });
    } else {
      redirectToPayment(paymentUrl);
    }
  };

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-12">
          <DiagramrLogo size="md" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
            {user ? (
              <Button onClick={() => navigate("/favorites")}>My Favorites</Button>
            ) : (
              <Button onClick={() => navigate("/auth")}>Sign in</Button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            <span>Beta Launch Offer</span>
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get unlimited access to educational diagrams with our early adopter pricing.
            Lock in these special rates during our beta period.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {/* Free Plan */}
          <motion.div variants={item}>
            <Card className="h-full transition-all hover:shadow-md border-border">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Free Plan</span>
                  <Badge variant="secondary">Standard</Badge>
                </CardTitle>
                <div className="flex items-baseline mt-3">
                  <span className="text-3xl font-bold">₹0</span>
                  <span className="ml-1 text-muted-foreground">/forever</span>
                </div>
                <CardDescription className="mt-2">
                  Perfect for casual learners and students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Access to high-quality educational diagrams</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>30 searches per day</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Save favorites</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Basic filter options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Study mode</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" onClick={() => navigate("/auth")}>
                  {user ? "Current Plan" : "Sign Up Free"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div variants={item}>
            <Card className="h-full transition-all hover:shadow-md relative overflow-hidden border-primary/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -translate-y-20 translate-x-20 blur-2xl pointer-events-none" />
              
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Premium</span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    Best Value
                  </Badge>
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-bold">₹399</span>
                  <span className="text-muted-foreground font-medium line-through">₹1199</span>
                  <span className="ml-1 text-muted-foreground">/lifetime</span>
                </div>
                <CardDescription className="mt-2">
                  Early beta special offer, limited time only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start">
                    <Infinity className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span className="font-medium">Unlimited searches forever</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span className="font-medium">Priority search results</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Advanced filters and sorting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Unlimited bookmarks and collections</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Enhanced study mode with notes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Early access to new features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full relative group overflow-hidden"
                  onClick={() => handleUpgradeClick("https://rzp.io/rzp/PO66xQq")}
                >
                  <span className="relative z-10">Get Lifetime Access</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-primary/20 group-hover:opacity-80 opacity-0 transition-opacity duration-300"></span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-xl font-semibold mb-3">Need monthly access instead?</h2>
          <Button 
            variant="outline" 
            className="mx-auto"
            onClick={() => handleUpgradeClick("https://rzp.io/rzp/KYo2irKm")}
          >
            Get Monthly Plan (₹299/month)
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Lifetime access is a one-time payment, not a subscription.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-24 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4">100% Satisfaction Guarantee</h2>
          <p className="text-muted-foreground">
            If you're not satisfied with Diagramr within 7 days of purchase, we'll refund your payment.
            No questions asked. We're that confident in the value we provide.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
