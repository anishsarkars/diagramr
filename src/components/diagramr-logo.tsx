
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface DiagramrLogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isLoading?: boolean;
  showBeta?: boolean;
}

export function DiagramrLogo({ 
  className, 
  textClassName,
  size = "md",
  isLoading = false,
  showBeta = true
}: DiagramrLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16", 
    xl: "h-24 w-24",
    "2xl": "h-32 w-32"
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
          src="/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png" 
          alt="Diagramr Logo" 
          className="h-full w-full object-contain drop-shadow-lg" 
        />
      </motion.div>
      
      {showBeta && (
        <Badge 
          variant="outline" 
          className="ml-2 text-xs px-2 py-0.5 h-auto border-primary/50 text-primary font-medium bg-primary/5"
        >
          BETA
        </Badge>
      )}
    </div>
  );
}
