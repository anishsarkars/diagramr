
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedContainer({ 
  children, 
  className, 
  delay = 0 
}: AnimatedContainerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ 
          duration: 0.4, 
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1] 
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
