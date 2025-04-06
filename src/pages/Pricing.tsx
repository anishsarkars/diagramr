import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon, SparklesIcon, Clock, Star, Shield, Rocket, Zap, Infinity, ArrowRight, X } from "lucide-react";
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showShimmer, setShowShimmer] = useState(false);

  // Check if current user is on premium plan
  const isPremium = profile?.is_premium;

  // Show shimmer effect every few seconds on premium plan
  useEffect(() => {
    if (hoveredCard === "Premium") return;
    
    const interval = setInterval(() => {
      setShowShimmer(true);
      setTimeout(() => setShowShimmer(false), 1500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hoveredCard]);

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
      limitations: [
        "Limited search results",
        "No AI-powered features",
        "No priority support"
      ],
      isPopular: false,
      buttonText: user ? (isPremium ? "Downgrade" : "Current Plan") : "Get Started",
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
      buttonText: isPremium ? "Current Plan" : "Upgrade Now",
      buttonAction: () => {
        if (!user) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
        } else if (!isPremium) {
          // Handle subscription logic
          window.open("https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2", "_blank");
        }
      },
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        {/* Premium background elements */}
        <div className="absolute top-0 left-0 right-0 h-[800px] overflow-hidden -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-[15%] left-[5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[30%] w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[120px]" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0djJoLTJ2LTRoMTR6TTI0IDI0djJoMTB2LTJoMnYyaDJ2Mkg0NnYySDI0di02aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>
        
        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-block mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary relative overflow-hidden group">
                <motion.span 
                  className="absolute inset-0 bg-primary/10"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.5, 
                    ease: "linear", 
                    repeatDelay: 3
                  }}
                />
                <SparklesIcon className="h-3.5 w-3.5 mr-1.5 animate-pulse" /> Premium Experience
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Elevate Your Learning Journey
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Choose the plan that fits your needs and unlock a world of educational diagrams and advanced features designed to enhance your learning experience
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`rounded-xl border backdrop-blur-sm shadow-lg relative overflow-hidden ${
                    plan.isPopular
                      ? "border-primary/30 bg-gradient-to-b from-primary/[0.07] to-primary/[0.03]"
                      : "border-border/60 bg-background/60"
                  } ${selectedPlan === plan.name ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                  onHoverStart={() => setHoveredCard(plan.name)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => setSelectedPlan(plan.name)}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* Shimmer effect */}
                  {plan.isPopular && (showShimmer || hoveredCard === plan.name) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -z-0 pointer-events-none"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  )}
                  
                  {plan.isPopular && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-medium py-1 px-3 rounded-bl-md rounded-tr-md shadow-sm">
                        RECOMMENDED
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <motion.div 
                      className="flex items-center justify-between mb-4"
                      initial={false}
                      animate={{
                        y: hoveredCard === plan.name ? [0, -3, 3, 0] : 0,
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <h3 
                        className="text-xl font-bold flex items-center gap-2"
                      >
                        <motion.div
                          animate={{
                            rotate: hoveredCard === plan.name ? [0, -15, 15, 0] : 0,
                          }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className={plan.isPopular ? "text-primary" : "text-muted-foreground"}
                        >
                          {plan.name === "Free" && <SearchIcon className="h-5 w-5" />}
                          {plan.name === "Premium" && <ZapIcon className="h-5 w-5" />}
                        </motion.div>
                        {plan.name}
                      </h3>
                      
                      {plan.isPopular && (
                        <motion.div
                          animate={{
                            scale: hoveredCard === plan.name ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Best Value
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <p className="text-muted-foreground text-sm mb-5">
                      {plan.description}
                    </p>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className={`text-4xl font-bold ${plan.isPopular ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'text-foreground'}`}>
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
                      
                      {/* Show limitations for Free plan */}
                      {plan.name === "Free" && (
                        <>
                          <div className="pt-2 mt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                            {plan.limitations?.map((limitation, idx) => (
                              <motion.div 
                                key={limitation} 
                                className="flex items-start gap-3 text-muted-foreground"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ 
                                  opacity: 1, 
                                  x: 0,
                                  transition: { delay: 0.5 + (idx * 0.1) }
                                }}
                              >
                                <X className="h-3 w-3 mt-0.5 text-muted-foreground/70" />
                                <span className="text-xs">{limitation}</span>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative"
                    >
                      <Button
                        className={`w-full h-11 font-medium ${
                          plan.isPopular && !isPremium
                            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0"
                            : ""
                        } ${isPremium && plan.name === "Premium" ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                        variant={(!plan.isPopular || (isPremium && plan.name !== "Premium")) ? "outline" : "default"}
                        onClick={plan.buttonAction}
                        size="lg"
                        disabled={(isPremium && plan.name === "Premium") || (!isPremium && plan.name === "Free")}
                      >
                        <span className="flex items-center gap-2">
                          {plan.buttonText}
                          {plan.isPopular && !isPremium && <ArrowRight className="h-4 w-4 ml-1" />}
                        </span>
                      </Button>
                      
                      {/* Current plan indicator */}
                      {((isPremium && plan.name === "Premium") || (!isPremium && plan.name === "Free")) && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-2 py-0.5">
                          <Badge variant="outline" className="bg-background text-xs border-primary/30 text-primary">
                            Current Plan
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="mt-20 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="bg-muted/30 border border-border/50 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-primary/[0.05] to-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute w-40 h-40 bg-primary/5 rounded-full -top-20 -right-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <h3 className="text-lg font-medium mb-3 flex items-center justify-center gap-2 relative">
                  <SparklesIcon className="h-5 w-5 text-primary animate-pulse" /> 
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">Special Beta Access</span>
                </h3>
                <p className="text-muted-foreground mb-4 max-w-xl mx-auto relative">
                  During our beta phase, most Premium features are available for free. Enjoy access to our educational diagrams and resources while we continue to improve Diagramr.
                </p>
                <Badge variant="outline" className="bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors duration-500">Limited Time Offer</Badge>
              </motion.div>
            </div>
          </motion.div>
          
          {/* FAQ Section */}
          <motion.div 
            className="mt-24 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <h2 className="text-2xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  question: "How do I upgrade to Premium?",
                  answer: "After signing up, simply click the 'Upgrade' button in the header or visit the Pricing page to select the Premium plan."
                },
                {
                  question: "Can I cancel my Premium subscription anytime?",
                  answer: "Yes, you can cancel your subscription at any time. You'll continue to have Premium access until the end of your billing period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept major credit/debit cards and popular online payment methods through our secure payment provider."
                }
              ].map((faq, i) => (
                <motion.div 
                  key={i}
                  className="border border-border/50 rounded-lg p-6 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + (i * 0.1), duration: 0.5 }}
                  whileHover={{ y: -2 }}
                >
                  <h3 className="font-medium mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
