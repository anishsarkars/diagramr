
import { Badge } from "@/components/ui/badge";
import { LinkedinIcon } from "lucide-react";
import { motion } from "framer-motion";

interface BuiltByBadgeProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "fixed";
}

export function BuiltByBadge({ className, position = "bottom-right" }: BuiltByBadgeProps) {
  const positionClasses = {
    "bottom-right": "absolute bottom-4 right-4",
    "bottom-left": "absolute bottom-4 left-4", 
    "fixed": "fixed bottom-4 right-4 z-50"
  };

  return (
    <motion.div
      className={position === "fixed" ? positionClasses.fixed : positionClasses[position]}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.3 }}
    >
      <a 
        href="https://www.linkedin.com/in/anishsarkar-/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="no-underline"
      >
        <Badge 
          variant="secondary" 
          className="gap-1.5 py-1.5 px-2.5 shadow-md backdrop-blur-sm bg-background/70 hover:bg-accent border border-border/30 transition-all group"
        >
          <span className="text-xs">Built by @Anish</span>
          <LinkedinIcon className="h-3 w-3 text-[#0077B5] group-hover:text-[#0077B5]/80 transition-colors" />
        </Badge>
      </a>
    </motion.div>
  );
}
