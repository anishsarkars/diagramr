
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";

interface DiagramrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  iconOnly?: boolean;
  showBeta?: boolean;
  isLoading?: boolean;
}

export function DiagramrLogo({ 
  className,
  size = "md",
  showText = false,
  iconOnly = true,
  showBeta = true,
  isLoading = false
}: DiagramrLogoProps) {
  const { isDarkMode } = useTheme();
  
  // Use the uploaded logo images based on theme
  const darkModeLogo = "/lovable-uploads/53cdad0f-c208-4480-bfad-8c61a8f9b2a7.png";
  const lightModeLogo = "/lovable-uploads/34af63ea-8ed2-4d69-8fd5-394c815ecaa5.png";
  
  // Use appropriate logo based on theme
  const logoSrc = isDarkMode ? darkModeLogo : lightModeLogo;
  
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto",
    xl: "h-16 w-auto",
    "2xl": "h-20 w-auto",
  };
  
  if (iconOnly) {
    return (
      <motion.div 
        className={cn("flex items-center", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={logoSrc}
          alt="Diagramr Logo"
          className={cn(sizeClasses[size], "object-contain")}
        />
        
        {showBeta && (
          <span className="ml-1 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
            Beta
          </span>
        )}
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={cn("flex items-center", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={logoSrc}
        alt="Diagramr Logo"
        className={cn(sizeClasses[size], "object-contain")}
      />
      
      {showText && (
        <div className="ml-2 flex flex-col items-start">
          <motion.span 
            className={cn(
              "font-bold tracking-tight text-foreground", 
              size === "sm" ? "text-lg" : 
              size === "lg" ? "text-2xl" : 
              size === "xl" ? "text-3xl" : 
              size === "2xl" ? "text-4xl" : "text-xl"
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Diagramr
          </motion.span>
          
          {showBeta && (
            <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
              Beta
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
