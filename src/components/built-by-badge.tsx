
import { motion } from "framer-motion";

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
    "fixed": "fixed bottom-4 right-4"
  };

  return (
    <motion.div 
      className={`absolute ${positionClasses[position]} z-10 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/30 shadow-sm">
        <p className="text-xs text-muted-foreground">Built by</p>
        <span className="text-xs font-medium">@Anish</span>
      </div>
    </motion.div>
  );
}
