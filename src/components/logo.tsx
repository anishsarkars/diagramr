
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  showText?: boolean;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isLoading?: boolean;
  showBeta?: boolean;
}

export function Logo({ 
  className, 
  iconOnly = true, 
  showText = false, 
  children, 
  size = "md",
  isLoading = false,
  showBeta = true
}: LogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto", 
    xl: "h-16 w-auto",
    "2xl": "h-20 w-auto"
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
          src={theme === 'dark' 
            ? "/lovable-uploads/b26fbef4-6b82-4fb4-bec9-43504a07565e.png" 
            : "/lovable-uploads/f5e36644-b381-4a3c-88ae-83437a706a20.png"}
          alt="Diagramr Logo" 
          className="h-full w-auto object-contain drop-shadow-md" 
        />
      </motion.div>
      
      {showBeta && (
        <Badge 
          variant="outline" 
          className="ml-1 text-[0.6rem] px-1.5 py-0 h-auto border-primary/30 text-primary-foreground/70"
        >
          BETA
        </Badge>
      )}
      
      {children}
    </div>
  );
}
