
import { DiagramrLogo } from "./diagramr-logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Book, Sparkles, GraduationCap, BookOpen, Search, Lightbulb, BookOpenCheck } from "lucide-react";

export function SiteLoader({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 flex flex-col items-center justify-center bg-background z-50", className)}>
      <div className="flex flex-col items-center space-y-6 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative"
        >
          <DiagramrLogo size="2xl" isLoading showBeta={false} />
          
          <motion.div 
            className="absolute -top-4 -right-4"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-64 h-2 bg-muted rounded-full overflow-hidden mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              delay: 0.6,
              duration: 1.5, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
        
        <motion.h2
          className="text-xl font-medium text-foreground mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Your Visual Learning Resource
        </motion.h2>
        
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, staggerChildren: 0.1 }}
        >
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <BookOpenCheck className="h-4 w-4 text-green-500" />
            <span>Find the perfect diagrams for your studies</span>
          </motion.p>
          
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <span>Educational Resources for Students & Researchers</span>
          </motion.p>
          
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Visualize Complex Concepts Easily</span>
          </motion.p>
        </motion.div>
        
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}
