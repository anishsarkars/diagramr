
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  showText?: boolean;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  showBeta?: boolean;
}

export function Logo({ 
  className, 
  iconOnly = false, 
  showText = true, 
  children, 
  size = "md",
  isLoading = false,
  showBeta = true
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
          src="/lovable-uploads/14b933d8-4bc5-478d-a61d-0f37bd0404b1.png" 
          alt="Diagramr Logo" 
          className="h-full w-full object-contain"
        />
      </motion.div>
      
      {showText && !iconOnly && (
        <div className="flex items-center">
          <motion.span 
            className={cn("font-bold text-foreground transition-colors", textSizeClasses[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Diagramr
          </motion.span>
          
          {showBeta && (
            <Badge 
              variant="outline" 
              className="ml-2 text-[0.6rem] px-1.5 py-0 h-auto border-primary/30 text-primary-foreground/70"
            >
              BETA
            </Badge>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
}
