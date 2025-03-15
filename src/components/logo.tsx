
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  showText?: boolean;
  children?: ReactNode;
}

export function Logo({ className, iconOnly = false, showText = true, children }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-8 w-8">
        <img 
          src="/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png" 
          alt="Diagramr Logo" 
          className="h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
        />
      </div>
      
      {showText && !iconOnly && (
        <span className="text-lg font-semibold text-foreground transition-colors">
          Diagramr
        </span>
      )}
      
      {children}
    </div>
  );
}
