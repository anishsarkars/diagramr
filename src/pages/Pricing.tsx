import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      price: "$0",
      period: "forever",
      features: [
        "20 searches per day",
        "Basic filters",
        "Access to educational diagrams",
        "Save diagrams to favorites",
      ],
      isPopular: false,
      buttonText: user ? "Current Plan" : "Get Started",
      buttonAction: () => navigate("/"),
    },
    {
      name: "Premium",
      price: "$3",
      period: "per month",
      features: [
        "50+ searches per day",
        "Ad-free experience",
        "Priority search results",
        "Save unlimited diagrams",
        "Premium support"
      ],
      isPopular: true,
      buttonText: "Upgrade",
      buttonAction: () => {
        if (!user) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
        } else {
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
        {/* Animated background gradients */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, var(--primary)/0.03, transparent 70%)",
              "radial-gradient(circle at 60% 60%, var(--primary)/0.03, transparent 70%)",
              "radial-gradient(circle at 20% 20%, var(--primary)/0.03, transparent 70%)",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div 
            className="absolute -right-1/4 top-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -left-1/4 bottom-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </motion.div>

        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-3xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Manage your plan
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Find the perfect educational diagrams to boost your studies and research
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
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
                      ? "border-primary/20 bg-primary/[0.03]"
                      : "border-border/60 bg-background/60"
                  } backdrop-blur-sm shadow-sm relative overflow-hidden`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                  onHoverStart={() => setHoveredCard(plan.name)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                >
                  {plan.isPopular && hoveredCard === plan.name && (
                    <motion.div
                      className="absolute inset-0 bg-primary/[0.02] pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  <div className="p-8">
                    <motion.h3 
                      className="text-lg font-medium mb-2 flex items-center gap-2"
                      initial={false}
                      animate={{
                        color: hoveredCard === plan.name ? "var(--primary)" : "var(--foreground)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{
                          rotate: hoveredCard === plan.name ? [0, -10, 10, 0] : 0,
                        }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {plan.name === "Free" && <SearchIcon className="h-4 w-4 text-muted-foreground" />}
                        {plan.name === "Premium" && <ZapIcon className="h-4 w-4 text-primary" />}
                      </motion.div>
                      {plan.name}
                    </motion.h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={feature} 
                          className="flex items-start gap-2 text-sm"
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
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          </motion.div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className={`w-full ${
                          plan.isPopular
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                        }`}
                        variant={plan.isPopular ? "default" : "outline"}
                        onClick={plan.buttonAction}
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
            className="mt-12 text-center text-muted-foreground text-sm max-w-xl mx-auto bg-muted/20 p-4 rounded-lg backdrop-blur-sm"
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
      
      <Footer />
    </div>
  );
};

export default Pricing;
