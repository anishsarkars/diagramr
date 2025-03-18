
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";

interface DiagramrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  iconOnly?: boolean;
  showBeta?: boolean;
}

export function DiagramrLogo({ 
  className,
  size = "md",
  showText = true,
  iconOnly = false,
  showBeta = true
}: DiagramrLogoProps) {
  const { isDarkMode } = useTheme();
  
  const logoSrc = isDarkMode 
    ? "/lovable-uploads/ade8aaaa-293a-4a73-bf2d-2490956a1578.png" 
    : "/lovable-uploads/ade8aaaa-293a-4a73-bf2d-2490956a1578.png";
  
  return (
    <div className={cn("flex items-center", className)}>
      <Logo 
        iconOnly={iconOnly} 
        showText={showText} 
        size={size} 
        showBeta={showBeta}
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
