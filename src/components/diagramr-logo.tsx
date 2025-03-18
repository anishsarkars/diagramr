
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
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20", 
    xl: "h-28 w-28",
    "2xl": "h-36 w-36",
    "3xl": "h-44 w-44",
    "4xl": "h-52 w-52"
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
            ? "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png" 
            : "/lovable-uploads/4de5a600-5de6-4ff0-a535-1b409d5c2393.png"}
          alt="Diagramr Logo" 
          className="h-full w-full object-contain drop-shadow-md transition-all duration-300" 
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
