
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
  const { isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-10 w-auto", // Increased size
    lg: "h-16 w-auto", // Increased size
    xl: "h-20 w-auto", // Increased size
    "2xl": "h-28 w-auto" // Increased size
  };
  
  // Use different logo based on theme
  const logoSrc = isDarkMode 
    ? "/lovable-uploads/f3f7be99-d517-49d2-af13-14b26120e656.png" 
    : "/lovable-uploads/ade8aaaa-293a-4a73-bf2d-2490956a1578.png";
  
  console.log("Logo using theme:", isDarkMode ? "dark" : "light", "logo source:", logoSrc);
  
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
