
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DiagramrLogoProps {
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function DiagramrLogo({ showText = true, className, textClassName }: DiagramrLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div 
        className="relative h-10 w-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src="/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png" 
          alt="Diagramr Logo" 
          className="h-full w-full object-contain"
        />
      </motion.div>
      
      {showText && (
        <motion.span 
          className={cn("text-2xl font-bold text-[#001934]", textClassName)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Diagramr
        </motion.span>
      )}
    </div>
  );
}
