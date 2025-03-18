
import { Badge } from "@/components/ui/badge";
import { LinkedinIcon } from "lucide-react";
import { motion } from "framer-motion";

interface BuiltByBadgeProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "fixed-left" | "fixed-right";
}

export function BuiltByBadge({ className, position = "bottom-left" }: BuiltByBadgeProps) {
  const positionClasses = {
    "bottom-right": "absolute bottom-4 right-4",
    "bottom-left": "absolute bottom-4 left-4", 
    "fixed-left": "fixed bottom-6 left-6 z-50",
    "fixed-right": "fixed bottom-6 right-6 z-50"
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
          className="gap-1.5 py-1.5 px-3 shadow-md backdrop-blur-sm bg-background/90 hover:bg-accent border border-border/30 transition-all group"
        >
          <span className="text-sm font-medium">Built by @Anish</span>
          <LinkedinIcon className="h-4 w-4 text-[#0077B5] group-hover:text-[#0077B5]/80 transition-colors" />
        </Badge>
      </a>
    </motion.div>
  );
}
