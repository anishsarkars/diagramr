
import { motion } from "framer-motion";
import { CheckCircle, ZapIcon, SearchIcon, FileTextIcon, HeartIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      name: "Pro",
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
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Find the perfect educational diagrams to boost your studies and research
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl overflow-hidden border ${
                  plan.isPopular
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-background/60"
                } backdrop-blur-sm shadow-lg relative`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-bl-lg">
                      Recommended
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {plan.name === "Free" && <SearchIcon className="h-5 w-5 text-muted-foreground" />}
                    {plan.name === "Pro" && <ZapIcon className="h-5 w-5 text-primary" />}
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground mb-1">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
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
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-2">Why Choose Diagramr Pro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Upgrade to access more educational diagrams and resources to enhance your academic journey
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-4 rounded-lg">
                <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">More Daily Searches</h3>
                <p className="text-sm text-muted-foreground">
                  Get 50+ searches per day to find all the educational diagrams you need.
                </p>
              </div>
              
              <div className="p-4 rounded-lg">
                <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Save Favorites</h3>
                <p className="text-sm text-muted-foreground">
                  Build unlimited collections of diagrams for your different study projects.
                </p>
              </div>
              
              <div className="p-4 rounded-lg">
                <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Priority Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get faster assistance for any questions about educational resources.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center text-muted-foreground text-sm max-w-2xl mx-auto bg-muted/30 p-4 rounded-lg">
              <p className="italic">
                <b>Note:</b> During our beta phase, most features are available for free. Enjoy free access to educational diagrams and resources while we continue to improve Diagramr.
              </p>
              <p className="mt-2">
                Diagramr is in the early stages and can sometimes make mistakes, but we're constantly working to improve the quality and accuracy of our results.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
