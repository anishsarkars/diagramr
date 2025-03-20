
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
    sm: "h-5 w-auto",
    md: "h-7 w-auto",
    lg: "h-12 w-auto",
    xl: "h-16 w-auto",
    "2xl": "h-20 w-auto"
  };
  
  // Use different logo based on theme
  const logoSrc = theme === 'dark'
    ? "/lovable-uploads/53cdad0f-c208-4480-bfad-8c61a8f9b2a7.png" 
    : "/lovable-uploads/34af63ea-8ed2-4d69-8fd5-394c815ecaa5.png";
  
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
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <img 
          src={logoSrc}
          alt="Diagramr Logo" 
          className="h-full w-auto object-contain drop-shadow-md" 
        />
      </motion.div>
      
      {showBeta && (
        <Badge 
          variant="outline" 
          className="ml-1 text-[0.6rem] px-1.5 py-0 h-auto border-primary/30 text-primary font-medium"
        >
          BETA
        </Badge>
      )}
      
      {children}
    </div>
  );
}
