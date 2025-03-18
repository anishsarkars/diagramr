
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

interface DiagramrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
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
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16", 
    xl: "h-24 w-24",
    "2xl": "h-32 w-32",
    "3xl": "h-40 w-40"
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
