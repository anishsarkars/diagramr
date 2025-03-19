
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";

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
  showText = false, // Changed default to false to prioritize logo-only display
  iconOnly = true,  // Changed default to true to prioritize logo-only display
  showBeta = true,
  isLoading = false
}: DiagramrLogoProps) {
  const { isDarkMode } = useTheme();
  
  // Use different logo based on theme
  const logoSrc = isDarkMode 
    ? "/lovable-uploads/f3f7be99-d517-49d2-af13-14b26120e656.png" 
    : "/lovable-uploads/ade8aaaa-293a-4a73-bf2d-2490956a1578.png";
  
  console.log("DiagramrLogo using theme:", isDarkMode ? "dark" : "light", "logo source:", logoSrc);
  
  return (
    <div className={cn("flex items-center", className)}>
      <Logo 
        iconOnly={iconOnly} 
        showText={showText} 
        size={size} 
        showBeta={showBeta}
        isLoading={isLoading}
        className={className}
      />
      
      {!iconOnly && showText && (
        <div className="ml-2 flex flex-col items-start">
          <span className={cn(
            "font-bold tracking-tight", 
            size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : size === "xl" ? "text-3xl" : size === "2xl" ? "text-4xl" : "text-xl"
          )}>
            Diagramr
          </span>
        </div>
      )}
    </div>
  );
}
