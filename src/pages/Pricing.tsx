
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Infinity, Star, Zap, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "@/components/footer";

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
  const redirectToPayment = () => {
    window.open("https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2", "_blank");
  };

  // Navigate to auth page if user is not logged in
  const handleUpgradeClick = () => {
    if (!user) {
      navigate("/auth", { state: { returnTo: "/pricing" } });
    } else {
      redirectToPayment();
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
              <Button onClick={() => navigate("/account")}>My Account</Button>
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
            Most features are free during beta testing.
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
                    <span>5 AI generations per day</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Save favorites (during beta)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>Basic filter options</span>
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
                    Beta Special
                  </Badge>
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-bold">₹89</span>
                  <span className="text-muted-foreground font-medium line-through">₹599</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-2">
                  Early beta special offer, available now.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      <span className="font-semibold">Beta Special:</span> Most premium features are available to free users during the beta period. Enjoy!
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start">
                    <Infinity className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span className="font-medium">Unlimited searches</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span className="font-medium">15 AI-generated diagrams per day</span>
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
                  onClick={handleUpgradeClick}
                >
                  <span className="relative z-10">Upgrade Now</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-primary/20 group-hover:opacity-80 opacity-0 transition-opacity duration-300"></span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-24 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4">Join Our Beta Program</h2>
          <p className="text-muted-foreground">
            During our beta testing phase, most premium features are available to all users for free. 
            Sign up now to get early access and provide feedback to help us improve Diagramr.
          </p>
          <Button 
            className="mt-6" 
            size="lg"
            onClick={() => navigate("/auth")}
          >
            Get Started For Free
          </Button>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
