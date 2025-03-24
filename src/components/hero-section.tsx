
import { motion } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect } from "react";
import { Search, LayoutTemplate, BookOpen, 
  Network, Database, Workflow, Flower, Activity,
  GitBranch, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { SimpleSearchBar } from "./simple-search-bar";
import { Badge } from "./ui/badge";
import { useAccess } from "./access-context";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const { user } = useAuth();
  const { isPremiumUser, isAnishInvite } = useAccess();
  const navigate = useNavigate();
  
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
    { label: "Visualize complex academic concepts", icon: <GitBranch className="h-4 w-4 mr-2" /> },
    { label: "Discover scientific illustrations & charts", icon: <Activity className="h-4 w-4 mr-2" /> },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.div 
      className={`container pt-16 md:pt-24 pb-16 text-center flex flex-col items-center justify-center relative ${
        isPremiumUser ? "bg-gradient-to-b from-background to-background/95" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className={`absolute top-20 left-1/4 w-96 h-96 ${
            isPremiumUser ? "bg-purple-500/10" : "bg-primary/5"
          } rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2`}
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
          className={`absolute bottom-20 right-1/4 w-96 h-96 ${
            isPremiumUser ? "bg-amber-500/10" : "bg-primary/10"
          } rounded-full blur-3xl`}
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
        className="mb-6 relative"
      >
        <DiagramrLogo size="lg" showBeta iconOnly={true} showText={false} className="mb-2" />
        {isPremiumUser && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -right-6 -top-3"
          >
            <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white border-none px-2 py-1 text-xs">
              {isAnishInvite ? "@Anish Invite" : "Premium"}
            </Badge>
          </motion.div>
        )}
      </motion.div>
      
      <motion.h1 
        className={`font-bold text-4xl md:text-6xl lg:text-7xl mb-4 ${
          isPremiumUser 
          ? "bg-gradient-to-r from-amber-300 via-purple-500 to-amber-300 bg-clip-text text-transparent"
          : "bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Find the Perfect Diagrams
        {isPremiumUser && <Sparkles className="inline-block ml-2 h-8 w-8 text-amber-400" />}
      </motion.h1>
      
      <motion.div
        className="mb-6 text-muted-foreground text-xl max-w-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p>
          Search for educational diagrams, charts, and visualizations to boost your studies and research
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
              index === currentFeatureIndex ? (isPremiumUser ? "text-purple-500" : "text-primary") : "text-transparent"
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
          onSearch={(query) => onSearch(query)} 
          isLoading={isLoading}
          className={`shadow-lg ${isPremiumUser ? "ring-1 ring-purple-500/20" : ""}`}
          placeholder="Search for educational diagrams and visualizations..."
        />
      </motion.div>
      
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        <div className="w-full text-sm text-muted-foreground mb-2">Popular academic searches:</div>
        {exampleSearches.map((example, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full ${
                isPremiumUser 
                ? "border-purple-500/20 hover:bg-purple-500/5" 
                : "border-primary/20 hover:bg-primary/5"
              }`}
              onClick={() => onSearch(example)}
            >
              <Search className="h-3 w-3 mr-1.5" />
              {example}
            </Button>
          </motion.div>
        ))}
      </motion.div>
      
      <SearchLimitIndicator />
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div 
          className={`bg-background/50 backdrop-blur-sm p-4 rounded-xl border ${
            isPremiumUser ? "border-purple-500/10" : "border-border/30"
          }`}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className={`${isPremiumUser ? "text-purple-500" : "text-primary"} mb-2`}>
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">For Students</h3>
          <p className="text-sm text-muted-foreground">Find educational diagrams to understand complex academic concepts</p>
        </motion.div>
        
        <motion.div 
          className={`bg-background/50 backdrop-blur-sm p-4 rounded-xl border ${
            isPremiumUser ? "border-purple-500/10" : "border-border/30"
          }`}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className={`${isPremiumUser ? "text-purple-500" : "text-primary"} mb-2`}>
            <GitBranch className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">For Researchers</h3>
          <p className="text-sm text-muted-foreground">Discover scientific visualizations for papers and presentations</p>
        </motion.div>
        
        <motion.div 
          className={`bg-background/50 backdrop-blur-sm p-4 rounded-xl border ${
            isPremiumUser ? "border-purple-500/10" : "border-border/30"
          }`}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className={`${isPremiumUser ? "text-purple-500" : "text-primary"} mb-2`}>
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">For Educators</h3>
          <p className="text-sm text-muted-foreground">Access visual resources for lectures and coursework</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
