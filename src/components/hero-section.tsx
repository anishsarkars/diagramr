
import { motion } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect } from "react";
import { Search, LayoutTemplate, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { SimpleSearchBar } from "./simple-search-bar";

interface HeroSectionProps {
  onSearch: (query: string, mode: "search" | "generate") => void;
  isLoading?: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Simplified for cleaner UI
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const features = [
    { label: "Find professional diagrams & visualizations", icon: <LayoutTemplate className="h-4 w-4 mr-2" /> },
    { label: "Visual aids for presentations", icon: <Sparkles className="h-4 w-4 mr-2" /> },
    { label: "Technical diagrams for documentation", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { label: "Understand difficult topics faster", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.div 
      className="container pt-10 md:pt-16 pb-10 text-center flex flex-col items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <DiagramrLogo size="2xl" showBeta className="mb-2" />
      </motion.div>
      
      <motion.h1 
        className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Find Perfect Diagrams
      </motion.h1>
      
      <motion.div
        className="mb-8 text-muted-foreground text-xl max-w-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p>
          The ultimate search engine for diagrams, visualizations, and educational images
        </p>
      </motion.div>
      
      <motion.div
        className="mb-6 h-8 overflow-hidden relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
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
            transition={{ duration: 0.5 }}
          >
            {feature.icon}
            <span className="font-medium">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="w-full max-w-2xl mx-auto mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <SimpleSearchBar 
          onSearch={(query, mode) => onSearch(query, "search")} 
          isLoading={isLoading}
          className="shadow-lg"
        />
      </motion.div>
      
      <motion.div
        className="flex justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <SearchLimitIndicator />
      </motion.div>
      
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="gap-2 shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Sign up for more searches</span>
          </Button>
        </motion.div>
      )}
      
      {/* Use cases section */}
      <motion.div
        className="mt-16 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-8">Perfect for</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <BookOpen className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Academic Research</h3>
            <p className="text-muted-foreground">Find detailed diagrams for papers, presentations, and study materials</p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <LayoutTemplate className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Business Workflows</h3>
            <p className="text-muted-foreground">Discover professional diagrams for reports, processes and presentations</p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <Lightbulb className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Engineering & Tech</h3>
            <p className="text-muted-foreground">Access technical diagrams for documentation, architecture, and systems</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
