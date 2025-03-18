
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

interface DiagramrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  isLoading?: boolean;
  showBeta?: boolean;
  showText?: boolean;
}

export function DiagramrLogo({ 
  className, 
  size = "md",
  isLoading = false,
  showBeta = true,
  showText = false
}: DiagramrLogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: "h-10 w-auto",
    md: "h-14 w-auto",
    lg: "h-20 w-auto", 
    xl: "h-28 w-auto",
    "2xl": "h-36 w-auto",
    "3xl": "h-44 w-auto",
    "4xl": "h-52 w-auto"
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
        whileHover={{ scale: 1.05 }}
      >
        <img 
          src={theme === 'dark' 
            ? "/lovable-uploads/b26fbef4-6b82-4fb4-bec9-43504a07565e.png" 
            : "/lovable-uploads/f5e36644-b381-4a3c-88ae-83437a706a20.png"}
          alt="Diagramr Logo" 
          className="h-full w-auto object-contain drop-shadow-md transition-all duration-300" 
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
