
import { motion } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect } from "react";
import { Search, LayoutTemplate, BookOpen, Server, 
  Network, Database, Workflow, Flower, Activity,
  GitBranch } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { SimpleSearchBar } from "./simple-search-bar";
import { Badge } from "./ui/badge";

interface HeroSectionProps {
  onSearch: (query: string, mode: "search" | "generate") => void;
  isLoading?: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const exampleSearches = [
    "system architecture diagram",
    "network topology diagram",
    "entity relationship diagram",
    "uml class diagram",
    "data structure visualization"
  ];
  
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const features = [
    { label: "Find professional diagrams & visualizations", icon: <LayoutTemplate className="h-4 w-4 mr-2" /> },
    { label: "Technical diagrams for documentation", icon: <GitBranch className="h-4 w-4 mr-2" /> },
    { label: "Visualize complex concepts instantly", icon: <Activity className="h-4 w-4 mr-2" /> },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.div 
      className="container pt-16 md:pt-24 pb-16 text-center flex flex-col items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5]
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
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.5, 0.7]
          }}
          transition={{
            duration: 7,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <DiagramrLogo size="lg" showBeta iconOnly={true} showText={false} className="mb-2" />
      </motion.div>
      
      <motion.h1 
        className="font-bold text-4xl md:text-6xl lg:text-7xl mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Academic & Research Diagrams
      </motion.h1>
      
      <motion.div
        className="mb-6 text-muted-foreground text-xl max-w-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p>
          Search platform for educational visualizations and technical diagrams
        </p>
      </motion.div>
      
      <motion.div
        className="mb-8 h-8 overflow-hidden relative"
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
        className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        <div className="w-full text-sm text-muted-foreground mb-2">Try searching for:</div>
        {exampleSearches.map((example, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="rounded-full border-primary/20 hover:bg-primary/5"
            onClick={() => onSearch(example, "search")}
          >
            <Search className="h-3 w-3 mr-1.5" />
            {example}
          </Button>
        ))}
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div 
          className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/30"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="text-primary mb-2">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">For Students</h3>
          <p className="text-sm text-muted-foreground">Find educational diagrams to understand complex concepts</p>
        </motion.div>
        
        <motion.div 
          className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/30"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="text-primary mb-2">
            <GitBranch className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">For Researchers</h3>
          <p className="text-sm text-muted-foreground">Technical diagrams for papers and documentation</p>
        </motion.div>
        
        <motion.div 
          className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/30"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="text-primary mb-2">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">For Educators</h3>
          <p className="text-sm text-muted-foreground">Visual resources for lectures and presentations</p>
        </motion.div>
      </motion.div>
      
      <motion.div
        className="flex justify-center mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
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
    </motion.div>
  );
}
