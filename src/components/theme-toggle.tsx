
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useAccess } from "./access-context";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "icon", 
  className 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { isPremium } = useAccess(); // Updated from isPremiumUser
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`relative overflow-hidden h-8 w-8 rounded-md hover:bg-background/80 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: theme === "dark" ? 0 : 1, 
          scale: theme === "dark" ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-3.5 w-3.5 opacity-70" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: theme === "light" ? 0 : 1, 
          scale: theme === "light" ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-3.5 w-3.5 opacity-70" />
      </motion.div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
