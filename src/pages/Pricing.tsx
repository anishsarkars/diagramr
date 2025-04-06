import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon, SparklesIcon, Clock, Star, Shield, Rocket, Zap, Infinity, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useState, useEffect } from "react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animatePlan, setAnimatePlan] = useState<string | null>(null);

  // Animate the recommended plan after a short delay for logged-in users
  useEffect(() => {
    if (user && !profile?.is_premium) {
      const timer = setTimeout(() => {
        setAnimatePlan("Premium");
        setTimeout(() => setAnimatePlan(null), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

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
      buttonText: user ? (profile?.is_premium ? "Downgrade" : "Current Plan") : "Get Started",
      buttonAction: () => navigate("/"),
      disabled: user && !profile?.is_premium,
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
      buttonText: profile?.is_premium ? "Current Plan" : "Upgrade Now",
      buttonAction: () => {
        if (!user) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
        } else {
          // Handle subscription logic
          window.open("https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2", "_blank");
        }
      },
      disabled: user && profile?.is_premium,
    }
  ];

  // Personalized greeting for logged-in users
  const getPersonalizedHeading = () => {
    if (!user) return "Unlock the Power of Educational Diagrams";
    
    if (profile?.is_premium) {
      return `Thanks for being a Premium member, ${profile.username || 'there'}!`;
    }
    
    return `Upgrade your Experience, ${profile?.username || 'there'}!`;
  };

  // Personalized subheading for logged-in users
  const getPersonalizedSubheading = () => {
    if (!user) {
      return "Choose the plan that fits your needs and elevate your learning experience with our premium features";
    }
    
    if (profile?.is_premium) {
      return "You're enjoying all premium features. Here's a breakdown of your benefits:";
    }
    
    return "Take your learning experience to the next level with Premium features";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        {/* Enhanced background decoration for premium feel */}
        <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-[15%] left-[5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
          
          {/* Additional animated elements for logged-in users */}
          {user && (
            <>
              <motion.div 
                className="absolute top-[30%] right-[5%] w-[200px] h-[200px] bg-yellow-500/10 rounded-full blur-[80px]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div 
                className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[90px]"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.25, 0.2],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1,
                }}
              />
            </>
          )}
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
                {user && profile?.is_premium ? (
                  <motion.div 
                    className="flex items-center"
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Crown className="h-3.5 w-3.5 mr-1.5" /> Your Premium Membership
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex items-center"
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SparklesIcon className="h-3.5 w-3.5 mr-1.5" /> Choose Your Plan
                  </motion.div>
                )}
              </Badge>
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {getPersonalizedHeading()}
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {getPersonalizedSubheading()}
            </motion.p>
          </motion.div>
          
          {/* Special personalized section for logged-in users */}
          {user && !profile?.is_premium && (
            <motion.div 
              className="max-w-3xl mx-auto -mt-8 mb-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-5 flex items-center gap-4">
                <motion.div 
                  className="absolute -right-20 -top-20 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] z-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 relative z-10">
                  <SparklesIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 z-10">
                  <h3 className="text-base font-medium mb-1">Personalized Recommendation</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your usage patterns, Premium would unlock substantial benefits for your educational journey.
                  </p>
                </div>
                <motion.div
                  className="flex-shrink-0 z-10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                    onClick={() => {
                      setHoveredCard("Premium");
                      document.getElementById('premium-plan')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    See Premium 
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
          
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
                  id={`${plan.name.toLowerCase()}-plan`}
                  className={`rounded-xl border ${
                    plan.isPopular
                      ? "border-primary/30 bg-gradient-to-b from-primary/[0.05] to-primary/[0.02]"
                      : "border-border/60 bg-background/60"
                  } backdrop-blur-sm shadow-lg relative overflow-hidden ${plan.disabled ? 'opacity-70' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: animatePlan === plan.name ? [1, 1.05, 1] : 1,
                    boxShadow: animatePlan === plan.name 
                      ? ["0 0 0 rgba(0, 0, 0, 0)", "0 0 25px rgba(124, 58, 237, 0.3)", "0 0 0 rgba(0, 0, 0, 0)"] 
                      : "none"
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.1 * (index + 1),
                    scale: { duration: 0.8 },
                    boxShadow: { duration: 0.8 }
                  }}
                  onHoverStart={() => !plan.disabled && setHoveredCard(plan.name)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={!plan.disabled ? {
                    y: -6,
                    boxShadow: plan.isPopular 
                      ? "0 20px 30px -5px rgba(124, 58, 237, 0.15), 0 10px 15px -5px rgba(124, 58, 237, 0.1)"
                      : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 },
                  } : {}}
                >
                  {/* Current plan indicator for logged in users */}
                  {user && ((profile?.is_premium && plan.name === "Premium") || (!profile?.is_premium && plan.name === "Free")) && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
                  )}
                  
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
                          className={plan.isPopular ? "text-primary" : "text-muted-foreground"}
                        >
                          {plan.name === "Free" && <SearchIcon className="h-5 w-5" />}
                          {plan.name === "Premium" && <ZapIcon className="h-5 w-5" />}
                        </motion.div>
                        {plan.name}
                      </h3>
                      
                      {/* Current plan badge for logged-in users */}
                      {user && ((profile?.is_premium && plan.name === "Premium") || (!profile?.is_premium && plan.name === "Free")) && (
                        <Badge variant="outline" className="bg-primary/5 text-primary px-2 text-xs font-normal">
                          Current
                        </Badge>
                      )}
                    </motion.div>
                    
                    <p className="text-muted-foreground text-sm mb-5">
                      {plan.description}
                    </p>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className={`text-4xl font-bold ${plan.isPopular ? "bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-purple-500" : "bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"}`}>
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
                      whileHover={!plan.disabled ? { scale: 1.02 } : {}}
                      whileTap={!plan.disabled ? { scale: 0.98 } : {}}
                      className={plan.disabled ? "opacity-70 cursor-not-allowed" : ""}
                    >
                      <Button
                        className={`w-full h-11 font-medium ${
                          plan.isPopular && !plan.disabled
                            ? "bg-primary hover:bg-primary/90 text-white"
                            : ""
                        }`}
                        variant={plan.isPopular && !plan.disabled ? "default" : "outline"}
                        onClick={!plan.disabled ? plan.buttonAction : undefined}
                        size="lg"
                        disabled={plan.disabled}
                      >
                        {plan.buttonText}
                        {plan.name === "Premium" && !profile?.is_premium && !plan.disabled && (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
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
