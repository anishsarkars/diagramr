
import { DiagramrLogo } from "./diagramr-logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SiteLoader({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 flex flex-col items-center justify-center bg-background", className)}>
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <DiagramrLogo size="2xl" isLoading showBeta={false} />
        </motion.div>
        
        <motion.div 
          className="w-48 h-2 bg-muted rounded-full overflow-hidden mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              delay: 0.6,
              duration: 1.2, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
        
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Visualize knowledge instantly
        </motion.p>
      </div>
    </div>
  );
}
