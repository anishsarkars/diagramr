
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  showText?: boolean;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export function Logo({ 
  className, 
  iconOnly = false, 
  showText = true, 
  children, 
  size = "md",
  isLoading = false 
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10", 
    xl: "h-14 w-14"
  };
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-3xl"
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div 
        className={cn("relative", sizeClasses[size])}
        animate={isLoading ? { 
          rotate: 360,
          transition: { 
            duration: 2, 
            ease: "linear", 
            repeat: Infinity 
          } 
        } : {}}
      >
        <img 
          src="/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png" 
          alt="Diagramr Logo" 
          className="h-full w-full object-contain"
        />
      </motion.div>
      
      {showText && !iconOnly && (
        <motion.span 
          className={cn("font-bold text-foreground transition-colors", textSizeClasses[size])}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Diagramr
        </motion.span>
      )}
      
      {children}
    </div>
  );
}
