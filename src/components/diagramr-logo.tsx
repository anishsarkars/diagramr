
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
  const { theme } = useTheme();
  
  // Use the uploaded logo images based on theme
  const darkModeLogo = "/lovable-uploads/53cdad0f-c208-4480-bfad-8c61a8f9b2a7.png";
  const lightModeLogo = "/lovable-uploads/34af63ea-8ed2-4d69-8fd5-394c815ecaa5.png";
  
  // Use appropriate logo based on theme
  const logoSrc = theme === 'dark' ? darkModeLogo : lightModeLogo;
  
  const sizeClasses = {
    sm: "h-5 w-auto",
    md: "h-6 w-auto",
    lg: "h-8 w-auto",
    xl: "h-10 w-auto", // Reduced from h-12
    "2xl": "h-12 w-auto", // Reduced from h-14
  };
  
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
