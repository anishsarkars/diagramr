
import { motion, AnimatePresence } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect } from "react";
import { Book, BookOpen, Network, Database, Sparkles, ArrowRight, Search } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "./ui/input";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  
  const exampleSearches = [
    "human anatomy diagrams",
    "molecular structure visualization",
    "physics force diagrams",
    "data structures and algorithms",
    "circuit design diagrams"
  ];
  
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const features = [
    { label: "Find educational diagrams for your studies", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { label: "Visualize complex academic concepts", icon: <Network className="h-4 w-4 mr-2" /> },
    { label: "Discover scientific illustrations & charts", icon: <Database className="h-4 w-4 mr-2" /> },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <motion.div 
      className="min-h-[85vh] flex items-center justify-center bg-background py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Background gradient elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.4, 0.6]
          }}
          transition={{
            duration: 7,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 md:px-6">
        {/* Logo and title section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <DiagramrLogo size="lg" showBeta iconOnly={false} showText={true} className="mb-2" />
        </motion.div>
        
        <motion.h1 
          className="font-serif font-bold text-4xl md:text-6xl lg:text-7xl mb-4 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Find the Perfect Diagrams
        </motion.h1>
        
        <motion.div
          className="mb-8 text-muted-foreground text-xl max-w-2xl text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>
            Search for educational diagrams, charts, and visualizations to boost your studies and research
          </p>
        </motion.div>
        
        {/* Animated feature text */}
        <motion.div
          className="mb-8 h-8 overflow-hidden relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-center gap-2 absolute left-0 right-0 ${
                  index === currentFeatureIndex ? "text-primary" : "text-transparent"
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: index === currentFeatureIndex ? 0 : (index < currentFeatureIndex ? -20 : 20),
                  opacity: index === currentFeatureIndex ? 1 : 0
                }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
                <span className="font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Enhanced search input */}
        <motion.div 
          className="w-full max-w-3xl mx-auto mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 0.5, 
            delay: 0.6,
            scale: {
              delay: 1.5,
              duration: 0.8,
              repeat: 2,
              repeatType: "reverse"
            }
          }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="What diagrams are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-20 py-7 text-lg rounded-2xl border-primary/20 focus:border-primary shadow-md focus:ring-primary/30"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
              <Button
                type="submit"
                disabled={!searchQuery.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl px-5 py-6"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <>
                    <span className="mr-1">Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
        
        {/* Example searches */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <div className="w-full text-sm text-muted-foreground mb-2 text-center">Try these examples:</div>
          {exampleSearches.map((example, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-primary/20 hover:bg-primary/5"
                onClick={() => onSearch(example)}
              >
                <Sparkles className="h-3 w-3 mr-1.5 text-primary/70" />
                {example}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        
        <SearchLimitIndicator />
        
        {/* Call to action buttons */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8"
          >
            <Button 
              size="lg"
              className="rounded-full px-8"
              onClick={() => navigate('/auth')}
            >
              Get Started for Free
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
