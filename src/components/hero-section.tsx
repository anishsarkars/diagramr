
import { AIInput } from "./ai-input";
import { Button } from "@/components/ui/button";
import { DiagramrLogo } from "./diagramr-logo";
import { motion } from "framer-motion";
import { Search, Sparkles, Brain, Filter, BookOpen } from "lucide-react";

interface HeroSectionProps {
  onSearch: (prompt: string, mode: "search" | "generate") => void;
  isLoading: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const handlePopularSearch = (term: string) => {
    onSearch(term, "search");
  };

  return (
    <motion.div 
      className="relative min-h-[80vh] flex flex-col items-center justify-center w-full px-4 pt-20 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] bg-[#EC4899]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.6, 0.5],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1 
          }}
        />
      </div>
      
      <motion.div 
        className="mb-4 flex flex-col items-center text-center max-w-3xl mx-auto z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <DiagramrLogo className="mb-8 scale-150" />
        
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Find and generate the perfect
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"> diagram</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-8 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Diagramr helps students, educators, and professionals find, explore, and create diagrams for any purpose — powered by AI.
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="w-full max-w-3xl mx-auto z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <AIInput 
          onSubmit={onSearch}
          isLoading={isLoading}
          placeholder="Search for diagrams or describe what you need..."
          className="w-full"
        />
      </motion.div>
      
      <motion.div 
        className="mt-8 text-center z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Popular searches</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {["UML Class Diagram", "Network Architecture", "Data Structure Trees", 
            "System Design", "ER Diagram", "Cloud Infrastructure"].map((type) => (
            <Button 
              key={type} 
              variant="outline" 
              size="sm"
              className="mb-2"
              onClick={() => handlePopularSearch(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Smart Search</h3>
          <p className="text-muted-foreground">Find the perfect diagram with powerful search filters and AI recommendations.</p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">AI Generation</h3>
          <p className="text-muted-foreground">Generate custom diagrams by describing what you need in simple language.</p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Learning Resource</h3>
          <p className="text-muted-foreground">Perfect for students, researchers, and professionals to visualize complex concepts.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
