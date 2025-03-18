
import { Badge } from "@/components/ui/badge";
import { LinkedinIcon } from "lucide-react";
import { motion } from "framer-motion";

interface BuiltByBadgeProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "fixed-left" | "fixed-right";
}

export function BuiltByBadge({ className, position = "bottom-left" }: BuiltByBadgeProps) {
  const positionClasses = {
    "bottom-right": "absolute bottom-3 right-3",
    "bottom-left": "absolute bottom-3 left-3", 
    "fixed-left": "fixed bottom-4 left-4 z-50",
    "fixed-right": "fixed bottom-4 right-4 z-50"
  };

  return (
    <motion.div
      className={position.startsWith("fixed") ? positionClasses[position] : positionClasses[position]}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <a 
        href="https://www.linkedin.com/in/anishsarkar-/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="no-underline"
      >
        <Badge 
          variant="secondary" 
          className="gap-1 py-1 px-2 shadow-md backdrop-blur-sm bg-background/90 hover:bg-accent border border-border/30 transition-all group scale-90"
        >
          <span className="text-xs font-medium">Built by @Anish</span>
          <LinkedinIcon className="h-3.5 w-3.5 text-[#0077B5] group-hover:text-[#0077B5]/80 transition-colors" />
        </Badge>
      </a>
    </motion.div>
  );
}
