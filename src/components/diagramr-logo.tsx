
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DiagramrLogoProps {
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function DiagramrLogo({ showText = true, className, textClassName }: DiagramrLogoProps) {
  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        className="relative h-10 w-10"
        initial="hidden"
        animate="visible"
        variants={iconVariants}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] rounded-md transform rotate-45"
          variants={itemVariants}
        />
        <motion.div 
          className="absolute inset-0 border-2 border-white/80 rounded-md transform rotate-45 translate-x-1 translate-y-1"
          variants={itemVariants}
          transition={{ delay: 0.1 }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-bl from-[#8B5CF6]/50 to-[#EC4899]/50 rounded-md transform -rotate-45 scale-75"
          variants={itemVariants}
          transition={{ delay: 0.2 }}
        />
      </motion.div>
      
      {showText && (
        <motion.span 
          className={cn("text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]", textClassName)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          diagramr
        </motion.span>
      )}
    </div>
  );
}
