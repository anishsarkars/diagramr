
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ThemeToggle({ 
  variant = "outline", 
  size = "icon", 
  className 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={className}
    >
      <motion.div
        initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
        animate={{ 
          opacity: theme === "dark" ? 0 : 1, 
          rotate: theme === "dark" ? -30 : 0,
          scale: theme === "dark" ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-4 w-4" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
        animate={{ 
          opacity: theme === "light" ? 0 : 1, 
          rotate: theme === "light" ? 30 : 0,
          scale: theme === "light" ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-4 w-4" />
      </motion.div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
