
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

interface DiagramrLogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isLoading?: boolean;
  showBeta?: boolean;
  showText?: boolean;
}

export function DiagramrLogo({ 
  className, 
  textClassName,
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
    "2xl": "h-36 w-36"
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
          src={theme === 'dark' 
            ? "/lovable-uploads/5aa6a42f-771c-4e89-a3ba-e58ff53c701e.png" 
            : "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png"}
          alt="Diagramr Logo" 
          className="h-full w-full object-contain drop-shadow-lg transition-all duration-300" 
        />
      </motion.div>
      
      {showText && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={cn("font-bold text-2xl md:text-3xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", textClassName)}
        >
          Diagramr
        </motion.div>
      )}
      
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
