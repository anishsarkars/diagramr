import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon, SparklesIcon, Clock, Star, Shield, Rocket, Zap, Infinity, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useState, useEffect, useMemo } from "react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");
  
  // Animation effects for logged-in users
  const [animateParticles, setAnimateParticles] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Update window size on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger special animation effects when logged in
  useEffect(() => {
    if (user) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setAnimateParticles(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Calculate savings text based on billing period
  const savingsText = "Save 20%";
  
  // Settings for animation particles
  const particleCount = 15; // Reduced count to avoid performance issues
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * windowSize.width,
      y: Math.random() * windowSize.height,
      delay: Math.random() * 10
    }));
  }, [windowSize, particleCount]);

  const plans = [
    {
      name: "Free",
      price: activeTab === "monthly" ? "₹0" : "₹0",
      period: "forever",
      description: "Perfect for casual exploration of educational diagrams",
      features: [
        { text: "20 searches per day", icon: <Clock className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Basic filters and searching", icon: <SearchIcon className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Access to educational diagrams", icon: <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> },
        { text: "Save up to 20 diagrams", icon: <Star className="h-4 w-4 text-primary flex-shrink-0" /> },
      ],
      isPopular: false,
      buttonText: user && !profile?.is_premium ? "Current Plan" : "Get Started",
      buttonAction: () => navigate("/"),
    },
    {
      name: "Premium",
      price: activeTab === "monthly" ? "₹259" : "₹2499",
      period: activeTab === "monthly" ? "per month" : "per year",
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
      buttonText: user && profile?.is_premium ? "Current Plan" : "Upgrade Now",
      buttonAction: () => {
        if (!user) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
        } else {
          // Handle subscription logic - using different links based on billing period
          window.open(
            activeTab === "monthly" 
              ? "https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2" 
              : "https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2?billing=yearly",
            "_blank"
          );
        }
      },
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        {/* Animated background decoration elements */}
        <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden -z-10 opacity-30 pointer-events-none">
          <motion.div 
            className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute top-[15%] left-[5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1 
            }}
          />
          <motion.div 
            className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2 
            }}
          />
        </div>
        
        {/* Premium particles animation for logged-in users */}
        {user && animateParticles && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-primary/20 rounded-full"
                initial={{ 
                  x: particle.x, 
                  y: particle.y,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  y: [null, particle.y - 200 - (Math.random() * 300)], 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1 + Math.random() * 0.5, 0]
                }}
                transition={{ 
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: particle.delay
                }}
              />
            ))}
          </div>
        )}

        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
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
                <SparklesIcon className="h-3.5 w-3.5 mr-1" /> 
                {user ? 'Exclusive Pricing' : 'Choose Your Plan'}
              </Badge>
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {user && profile 
                ? `Welcome${profile.username ? `, ${profile.username}` : ''} to Premium Features`
                : "Unlock the Power of Educational Diagrams"}
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {user 
                ? "Enjoy a seamless experience with our premium features and elevate your learning journey" 
                : "Choose the plan that fits your needs and elevate your learning experience with our premium features"}
            </motion.p>
            
            {/* Billing toggle for logged-in users */}
            {user && (
              <motion.div 
                className="mt-8 inline-flex items-center bg-muted/50 p-1 rounded-full border border-border/40 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.button
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === "monthly" 
                      ? "bg-primary text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("monthly")}
                  whileTap={{ scale: 0.97 }}
                >
                  Monthly
                </motion.button>
                <motion.button
                  className={`py-2 px-4 rounded-full text-sm font-medium relative transition-all duration-200 ${
                    activeTab === "yearly" 
                      ? "bg-primary text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("yearly")}
                  whileTap={{ scale: 0.97 }}
                >
                  Yearly
                  <motion.span 
                    className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] font-bold py-0.5 px-1.5 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    {savingsText}
                  </motion.span>
                </motion.button>
              </motion.div>
            )}
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
                  key={`${plan.name}-${activeTab}`}
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
                  
                  {/* Spotlight effect for plan cards when logged in */}
                  {user && (
                    <motion.div 
                      className="absolute -inset-[100px] opacity-0 pointer-events-none"
                      animate={{ 
                        top: hoveredCard === plan.name ? -150 : -100,
                        left: hoveredCard === plan.name ? -150 : -100,
                        right: hoveredCard === plan.name ? -150 : -100,
                        bottom: hoveredCard === plan.name ? -150 : -100,
                        opacity: hoveredCard === plan.name ? 0.07 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: "radial-gradient(circle, rgba(128, 128, 255, 1) 0%, rgba(128, 128, 255, 0) 70%)",
                      }}
                    />
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
                  
                  {/* Current plan indicator for logged-in users */}
                  {user && 
                    ((plan.name === "Free" && !profile?.is_premium) || 
                     (plan.name === "Premium" && profile?.is_premium)) && (
                    <motion.div
                      className="absolute top-6 left-6 flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium py-1 px-2.5 rounded-full"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <User className="h-3 w-3" />
                      <span>Your Plan</span>
                    </motion.div>
                  )}
                  
                  {/* Premium glow effect for premium plan when logged in */}
                  {user && plan.isPopular && (
                    <motion.div
                      className="absolute h-px top-0 inset-x-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
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
                          {plan.name === "Premium" && (
                            <motion.div
                              animate={user ? {
                                rotate: [0, 15, 0],
                                scale: [1, 1.15, 1]
                              } : {}}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                repeatDelay: 1
                              }}
                            >
                              <Crown className="h-5 w-5 text-primary" />
                            </motion.div>
                          )}
                        </motion.div>
                        {plan.name}
                      </h3>
                    </motion.div>
                    
                    <p className="text-muted-foreground text-sm mb-5">
                      {plan.description}
                    </p>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <motion.span 
                        className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                        key={`${plan.price}-${activeTab}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {plan.price}
                      </motion.span>
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
                            ? (user ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-primary/20 text-white" : "bg-primary hover:bg-primary/90 text-white")
                            : ""
                        }`}
                        variant={plan.isPopular ? "default" : "outline"}
                        onClick={plan.buttonAction}
                        size="lg"
                      >
                        {plan.buttonText}
                        
                        {/* Subtle animation for premium button when logged in */}
                        {user && plan.isPopular && !profile?.is_premium && (
                          <motion.span 
                            className="absolute inset-0 rounded-md"
                            animate={{ 
                              boxShadow: ["0 0 0px 0px rgba(124, 58, 237, 0)", "0 0 15px 2px rgba(124, 58, 237, 0.3)", "0 0 0px 0px rgba(124, 58, 237, 0)"]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut"
                            }}
                          />
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
                {user ? "Your Special Access" : "Special Beta Access"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {user 
                  ? "Thank you for being part of our journey! Enjoy special access to our educational diagrams while we continue to improve Diagramr just for you." 
                  : "During our beta phase, most Premium features are available for free. Enjoy access to our educational diagrams and resources while we continue to improve Diagramr."}
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
