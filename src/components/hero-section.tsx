
import { AIInput } from "@/components/ai-input";
import { motion } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect } from "react";
import { CheckCircle2, Search, Sparkles, ImageIcon, LineChart, Network, Database, Users, BookOpen, PresentationIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";

interface HeroSectionProps {
  onSearch: (query: string, mode: "search" | "generate") => void;
  isLoading?: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const features = [
    { icon: Search, label: "Find professional diagrams & visualizations" },
    { icon: Sparkles, label: "Generate custom diagrams with AI" },
    { icon: BookOpen, label: "Educational resources for students" },
    { icon: PresentationIcon, label: "Visual aids for presentations" },
    { icon: Database, label: "Technical diagrams for documentation" },
    { icon: Users, label: "Visual explanations for teams" },
    { icon: Network, label: "Visualize complex concepts & relationships" },
    { icon: LineChart, label: "Understand difficult topics faster" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.div 
      className="container pt-16 md:pt-20 pb-16 text-center flex flex-col items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DiagramrLogo size="xl" showBeta className="mb-4" />
      </motion.div>
      
      <motion.h1 
        className="font-bold text-3xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Visualize Knowledge Instantly
      </motion.h1>
      
      <motion.div
        className="mb-8 text-muted-foreground text-lg max-w-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p>
          Find or create professional diagrams for learning, presentations, research, and development.
          Diagramr helps students, educators, and professionals visualize concepts with ease.
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
            <feature.icon className="h-5 w-5" />
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
        <AIInput 
          onSubmit={onSearch} 
          placeholder="Search for diagrams or describe a diagram to generate..." 
          isLoading={isLoading}
        />
      </motion.div>
      
      <motion.div
        className="flex justify-center flex-wrap gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <SearchLimitIndicator />
        
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
              className="gap-2 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Sign up for 30 daily searches</span>
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        className="mt-16 flex flex-wrap justify-center gap-6 md:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.7 }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>30 searches daily for free users</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>5 AI-generated diagrams daily</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>High-quality professional diagrams</span>
        </div>
      </motion.div>
      
      <div className="text-xs text-muted-foreground/60 mt-4 italic max-w-md text-center">
        Diagramr is in early beta and actively improving. Results and features may vary in quality as we enhance our service.
      </div>
    </motion.div>
  );
}
