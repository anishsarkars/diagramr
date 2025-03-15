
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface BuiltByBadgeProps {
  className?: string;
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | "fixed";
}

export function BuiltByBadge({ className, position = "bottom-right" }: BuiltByBadgeProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4",
    "fixed": "fixed bottom-4 right-4 z-50"
  };

  return (
    <motion.div 
      className={`${position === "fixed" ? "fixed" : "absolute"} ${positionClasses[position]} z-10 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <a 
        href="https://www.linkedin.com/in/anishsarkar-/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/30 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <p className="text-xs text-muted-foreground">Built by</p>
        <span className="text-xs font-medium text-foreground">@Anish</span>
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </a>
    </motion.div>
  );
}
