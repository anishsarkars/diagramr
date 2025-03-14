
import { AIInput } from "./ai-input";
import { Button } from "@/components/ui/button";
import { DiagramrLogo } from "./diagramr-logo";
import { motion } from "framer-motion";
import { Search, Sparkles, BookOpen, Lightbulb, ScrollText, GraduationCap } from "lucide-react";

interface HeroSectionProps {
  onSearch: (prompt: string, mode: "search" | "generate") => void;
  isLoading: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const handlePopularSearch = (term: string) => {
    onSearch(term, "search");
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5
      }
    })
  };

  const backgroundBlobVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.7, 0.5],
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <motion.div 
      className="relative min-h-[70vh] flex flex-col items-center justify-center w-full px-4 pt-12 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Simplified background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={backgroundBlobVariants.animate}
        />
        <motion.div 
          className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] bg-[#EC4899]/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.6, 0.5],
            transition: { 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse" as const,
              delay: 1 
            }
          }}
        />
      </div>
      
      <motion.div 
        className="mb-4 flex flex-col items-center text-center max-w-2xl mx-auto z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <DiagramrLogo className="mb-6 scale-125" />
        
        <motion.h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          Find and learn from
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"> diagrams</span>
        </motion.h1>
        
        <motion.p 
          className="text-md text-muted-foreground mb-6 max-w-xl"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          Quickly discover and understand complex concepts with visual diagrams — perfect for students preparing for exams and researchers.
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="w-full max-w-2xl mx-auto z-10"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
      >
        <AIInput 
          onSubmit={onSearch}
          isLoading={isLoading}
          placeholder="Search for diagrams or describe what you need..."
          className="w-full"
        />
      </motion.div>
      
      <motion.div 
        className="mt-6 text-center z-10"
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
      >
        <h3 className="text-xs font-medium mb-2 text-muted-foreground">Study topics</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {["UML Class Diagram", "Network Architecture", "Data Structures", 
            "System Design", "ER Diagram", "Cloud Infrastructure"].map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1), duration: 0.3 }}
            >
              <Button 
                variant="outline" 
                size="sm"
                className="mb-2 bg-background/40 backdrop-blur-sm border-border/30 hover:bg-background/60 text-xs"
                onClick={() => handlePopularSearch(type)}
              >
                {type}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto z-10"
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
      >
        <motion.div 
          className="flex flex-col items-center text-center"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mb-3">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium mb-1">Study Aid</h3>
          <p className="text-xs text-muted-foreground">Find diagrams to help study for exams and assignments.</p>
        </motion.div>
        
        <motion.div 
          className="flex flex-col items-center text-center"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium mb-1">AI Generation</h3>
          <p className="text-xs text-muted-foreground">Request custom diagrams to understand any concept.</p>
        </motion.div>
        
        <motion.div 
          className="flex flex-col items-center text-center"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mb-3">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium mb-1">Quick Reference</h3>
          <p className="text-xs text-muted-foreground">Save time with visual references for complex topics.</p>
        </motion.div>
      </motion.div>

      {/* Built by Anish Badge */}
      <motion.div 
        className="absolute bottom-2 right-4 md:right-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/30 shadow-sm">
          <p className="text-xs text-muted-foreground">Built by</p>
          <span className="text-xs font-medium">@Anish</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
