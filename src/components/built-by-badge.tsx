
import { Badge } from "@/components/ui/badge";
import { LinkedinIcon, Github, Twitter } from "lucide-react";
import { motion } from "framer-motion";

interface BuiltByBadgeProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "fixed-left" | "fixed-right";
  visible?: boolean;
}

export function BuiltByBadge({ 
  className, 
  position = "bottom-left",
  visible = true  // Change default to true to make the badge visible by default
}: BuiltByBadgeProps) {
  // If the badge is not visible, don't render anything
  if (!visible) return null;
  
  const positionClasses = {
    "bottom-right": "absolute bottom-3 right-3",
    "bottom-left": "absolute bottom-3 left-3", 
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
      <motion.div
        className="flex gap-2"
        whileHover="hover"
      >
        <a 
          href="https://www.linkedin.com/in/anishsarkar-/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Badge 
            variant="secondary" 
            className="gap-1 py-1.5 px-3 shadow-md backdrop-blur-sm bg-card/90 hover:bg-accent border border-border/30 transition-all group"
          >
            <span className="text-xs font-medium">Built by @Anish</span>
            <motion.div 
              className="flex gap-1"
              variants={{
                hover: { x: 0, opacity: 1 }
              }}
              initial={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LinkedinIcon className="h-3.5 w-3.5 text-[#0077B5] group-hover:text-[#0077B5]/80 transition-colors" />
            </motion.div>
          </Badge>
        </a>
        
        <motion.div 
          className="flex gap-1"
          variants={{
            hover: { x: 0, opacity: 1 }
          }}
          initial={{ x: -10, opacity: 0 }}
        >
          <a 
            href="https://github.com/Anish-Karthik" 
            target="_blank" 
            rel="noopener noreferrer"
            className="no-underline"
          >
            <Badge 
              variant="secondary" 
              className="py-1 px-2 shadow-md backdrop-blur-sm bg-card/90 hover:bg-accent border border-border/30 transition-all"
            >
              <Github className="h-3.5 w-3.5" />
            </Badge>
          </a>
          
          <a 
            href="https://twitter.com/anish_designer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="no-underline"
          >
            <Badge 
              variant="secondary" 
              className="py-1 px-2 shadow-md backdrop-blur-sm bg-card/90 hover:bg-accent border border-border/30 transition-all"
            >
              <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
            </Badge>
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
