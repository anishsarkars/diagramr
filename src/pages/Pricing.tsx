import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon, XCircle, ArrowRight, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      name: "Search Limit",
      free: "20 searches / day",
      premium: "50+ searches / day",
      tooltip: "The number of AI-powered diagram searches you can perform each day"
    },
    {
      name: "Save Diagrams",
      free: true,
      premium: true,
      tooltip: "Save your favorite diagrams to access them later"
    },
    {
      name: "Ad-Free Experience",
      free: false,
      premium: true,
      tooltip: "No advertisements while using the platform"
    },
    {
      name: "Priority Search Results",
      free: false,
      premium: true,
      tooltip: "Get access to higher quality diagram results first"
    },
    {
      name: "AI Generation Assist",
      free: "Basic",
      premium: "Advanced",
      tooltip: "AI assistance to help you find exactly what you need"
    },
    {
      name: "Educational Diagrams",
      free: "Standard",
      premium: "Premium",
      tooltip: "Access to our library of educational diagrams"
    },
    {
      name: "Priority Support",
      free: false,
      premium: true,
      tooltip: "Get faster responses to your questions and issues"
    }
  ];

  const benefits = [
    {
      icon: <motion.div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
              <ZapIcon className="h-4 w-4 text-primary" />
            </motion.div>,
      title: "Unlimited Access",
      description: "Unlock your full educational potential with unrestricted access to our entire collection of diagrams."
    },
    {
      icon: <motion.div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
              <SearchIcon className="h-4 w-4 text-primary" />
            </motion.div>,
      title: "Enhanced Search",
      description: "Find exactly what you need with our powerful search capabilities and priority results."
    },
    {
      icon: <motion.div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>,
      title: "Premium Content",
      description: "Access high-quality diagrams from top educational sources curated especially for academic excellence."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="fixed right-0 top-0 w-full h-full bg-blue-500/5 blur-[120px] z-[-1]" style={{ borderRadius: '70% 30% 70% 30% / 30% 30% 70% 70%' }} />
          <div className="fixed left-0 bottom-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] z-[-1]" style={{ borderRadius: '30% 70% 30% 70% / 70% 30% 70% 30%' }} />
        </div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary font-medium">
                Pick Your Plan
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Unlock the Full Power of Diagramr
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Choose the plan that fits your educational needs and take your learning to the next level
            </motion.p>
          </motion.div>
          
          {/* Benefits section */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="group rounded-xl p-6 border border-border/40 bg-card/20 backdrop-blur-sm hover:bg-card/30 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {benefit.icon}
                <h3 className="text-lg font-medium mt-4 mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Pricing plans */}
          <motion.div 
            className="max-w-4xl mx-auto mb-16 rounded-xl border border-border/40 bg-card/10 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-border/40">
              <div className="p-6">
                <h3 className="text-lg font-medium">Features</h3>
              </div>
              <div className="p-6 border-l border-border/40">
                <h3 className="text-lg font-medium flex items-center">
                  <SearchIcon className="h-4 w-4 mr-2 opacity-70" />
                  Free Plan
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Basic access for students</p>
              </div>
              <div className="p-6 border-l border-border/40 bg-primary/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <ZapIcon className="h-4 w-4 mr-2 text-primary" />
                      Premium Plan
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">For serious learners</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0">Recommended</Badge>
                </div>
              </div>
            </div>
            
            {/* Pricing row */}
            <div className="grid grid-cols-3 border-b border-border/40">
              <div className="p-6 flex items-center">
                <h3 className="font-medium">Price</h3>
              </div>
              <div className="p-6 border-l border-border/40">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">₹0</span>
                  <span className="text-muted-foreground text-sm">/forever</span>
                </div>
              </div>
              <div className="p-6 border-l border-border/40 bg-primary/5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">₹259</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
              </div>
            </div>
            
            {/* Features rows */}
            <TooltipProvider>
              {features.map((feature, index) => (
                <div 
                  key={feature.name} 
                  className={`grid grid-cols-3 ${index !== features.length - 1 ? 'border-b border-border/40' : ''}`}
                >
                  <div className="p-6 flex items-center">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium">{feature.name}</h3>
                      {feature.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 ml-1.5 text-muted-foreground/70 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="p-6 border-l border-border/40 flex items-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground/50" />
                      )
                    ) : (
                      <span className="text-sm">{feature.free}</span>
                    )}
                  </div>
                  <div className="p-6 border-l border-border/40 bg-primary/5 flex items-center">
                    {typeof feature.premium === 'boolean' ? (
                      feature.premium ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground/50" />
                      )
                    ) : (
                      <span className="text-sm font-medium">{feature.premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </TooltipProvider>
            
            {/* Button row */}
            <div className="grid grid-cols-3 bg-muted/20">
              <div className="p-6">
                {/* Empty cell */}
              </div>
              <div className="p-6 border-l border-border/40">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  {user ? "Current Plan" : "Get Started Free"}
                </Button>
              </div>
              <div className="p-6 border-l border-border/40 bg-primary/5">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (!user) {
                      navigate("/auth", { state: { returnTo: "/pricing" } });
                    } else {
                      // Handle subscription logic
                      window.open("https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2", "_blank");
                    }
                  }}
                >
                  {user ? "Upgrade Now" : "Sign Up & Upgrade"} 
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-8 text-center text-muted-foreground text-sm max-w-2xl mx-auto bg-muted/20 p-4 rounded-lg backdrop-blur-sm border border-border/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{
              backgroundColor: "var(--muted)",
              transition: { duration: 0.2 }
            }}
          >
            <p className="italic">
              During our beta phase, most features are available for free. Enjoy free access to educational diagrams and resources while we continue to improve Diagramr.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
