
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
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-brand-purple via-brand-pink to-brand-blue p-[2px] transition-all">
        <div className="z-10 flex h-full w-full items-center justify-center rounded-[5px] bg-card text-xl font-bold">
          <div className="bg-gradient-to-br from-brand-purple via-brand-pink to-brand-blue bg-clip-text text-transparent">
            D
          </div>
        </div>
      </div>
      
      {showText && !iconOnly && (
        <span className="text-lg font-semibold text-foreground">
          Diagramify
        </span>
      )}
      
      {children}
    </div>
  );
}
