import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon, SparklesIcon, Clock, Star, Shield, Rocket, Zap, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useState } from "react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for casual exploration of educational diagrams",
      features: [
        { text: "20 searches per day", icon: <Clock className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Basic filters and searching", icon: <SearchIcon className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Access to educational diagrams", icon: <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Save up to 20 diagrams", icon: <Star className="h-4 w-4 text-primary flex-shrink-0" /> },
      ],
      isPopular: false,
      buttonText: user ? "Current Plan" : "Get Started",
      buttonAction: () => navigate("/"),
    },
    {
      name: "Premium",
      price: "₹259",
      period: "per month",
      description: "Enhanced experience with premium features for students and educators",
      features: [
        { text: "Unlimited searches", icon: <Infinity className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Ad-free premium experience", icon: <Shield className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "AI-powered search results", icon: <SparklesIcon className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Save unlimited diagrams", icon: <Star className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Priority customer support", icon: <Rocket className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Early access to new features", icon: <Zap className="h-4 w-4 text-primary flex-shrink-0" /> },
      ],
      isPopular: true,
      buttonText: "Upgrade Now",
      buttonAction: () => {
        if (!user) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
        } else {
          window.open("https://checkout.dodopayments.com/buy/pdt_StmFpatk6LW4F2n3L46LL?quantity=1&redirect_url=https://diagramr.vercel.app", "_blank");
        }
      },
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-[15%] left-[5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="inline-block mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-1 border-primary/30 bg-primary/5 text-primary">
                <SparklesIcon className="h-3.5 w-3.5 mr-1" /> Choose Your Plan
              </Badge>
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Unlock the Power of Educational Diagrams
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Choose the plan that fits your needs and elevate your learning experience with our premium features
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`rounded-xl border ${
                    plan.isPopular
                      ? "border-primary/30 bg-gradient-to-b from-primary/[0.05] to-primary/[0.02]"
                      : "border-border/60 bg-background/60"
                  } backdrop-blur-sm shadow-lg relative overflow-hidden`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                  onHoverStart={() => setHoveredCard(plan.name)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 },
                  }}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-bl-md rounded-tr-md shadow-sm">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  {plan.isPopular && hoveredCard === plan.name && (
                    <motion.div
                      className="absolute inset-0 bg-primary/[0.03] pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  <div className="p-8">
                    <motion.div 
                      className="flex items-center justify-between mb-4"
                      initial={false}
                      animate={{
                        y: hoveredCard === plan.name ? [0, -2, 2, 0] : 0,
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <h3 
                        className="text-xl font-bold flex items-center gap-2"
                      >
                        <motion.div
                          animate={{
                            rotate: hoveredCard === plan.name ? [0, -10, 10, 0] : 0,
                          }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          {plan.name === "Free" && <SearchIcon className="h-5 w-5 text-muted-foreground" />}
                          {plan.name === "Premium" && <ZapIcon className="h-5 w-5 text-primary" />}
                        </motion.div>
                        {plan.name}
                      </h3>
                    </motion.div>
                    
                    <p className="text-muted-foreground text-sm mb-5">
                      {plan.description}
                    </p>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div 
                          key={feature.text} 
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { delay: 0.2 + (featureIndex * 0.1) }
                          }}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: hoveredCard === plan.name ? [1, 1.2, 1] : 1,
                            }}
                            transition={{ duration: 0.2, delay: featureIndex * 0.05 }}
                          >
                            {feature.icon}
                          </motion.div>
                          <span className="text-sm">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className={`w-full h-11 font-medium ${
                          plan.isPopular
                            ? "bg-primary hover:bg-primary/90 text-white"
                            : ""
                        }`}
                        variant={plan.isPopular ? "default" : "outline"}
                        onClick={plan.buttonAction}
                        size="lg"
                      >
                        {plan.buttonText}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="mt-16 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="bg-muted/30 border border-border/50 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-medium mb-3 flex items-center justify-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" /> 
                Special Beta Access
              </h3>
              <p className="text-muted-foreground mb-4">
                During our beta phase, most Premium features are available for free. Enjoy access to our educational diagrams and resources while we continue to improve Diagramr.
              </p>
              <Badge variant="outline" className="bg-primary/5 text-primary">Limited Time Offer</Badge>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
