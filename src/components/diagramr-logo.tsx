
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface DiagramrLogoProps {
  showText?: boolean;
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  showBeta?: boolean;
}

export function DiagramrLogo({ 
  showText = true, 
  className, 
  textClassName,
  size = "md",
  isLoading = false,
  showBeta = true
}: DiagramrLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14", 
    xl: "h-24 w-24"
  };
  
  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl", 
    xl: "text-4xl"
  };
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div 
        className={cn("relative", sizeClasses[size])}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isLoading ? {
          opacity: 1,
          scale: 1,
          rotate: 360,
          transition: { 
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            rotate: { 
              duration: 2, 
              ease: "linear", 
              repeat: Infinity 
            }
          }
        } : { 
          opacity: 1, 
          scale: 1,
          transition: { duration: 0.5 }
        }}
      >
        <img 
          src={size === "xl" ? "/lovable-uploads/1fcd5d05-8fe4-4a85-a06e-0797163cce27.png" : "/lovable-uploads/1fcd5d05-8fe4-4a85-a06e-0797163cce27.png"} 
          alt="Diagramr Logo" 
          className="h-full w-full object-contain drop-shadow-md dark:invert-0 dark:brightness-100"
        />
      </motion.div>
      
      {showText && (
        <div className="flex items-center">
          <motion.span 
            className={cn("font-bold text-foreground", textSizeClasses[size], textClassName)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Diagramr
          </motion.span>
          
          {showBeta && (
            <Badge 
              variant="outline" 
              className="ml-2 text-[0.6rem] px-1.5 py-0 h-auto border-primary/30 text-primary"
            >
              BETA
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
