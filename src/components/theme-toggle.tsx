
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
  variant = "outline", 
  size = "icon", 
  className 
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { isPremiumUser } = useAccess();
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`relative overflow-hidden ${
        isPremiumUser 
          ? "border-purple-500/20 hover:bg-purple-500/10" 
          : ""
      } ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
        animate={{ 
          opacity: theme === "dark" ? 0 : 1, 
          rotate: theme === "dark" ? -30 : 0,
          scale: theme === "dark" ? 0.8 : 1,
        }}
        transition={{ duration: 0.3, type: "spring" }}
        className="absolute"
      >
        <Sun className={`h-4 w-4 ${isPremiumUser ? "text-amber-500" : ""}`} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
        animate={{ 
          opacity: theme === "light" ? 0 : 1, 
          rotate: theme === "light" ? 30 : 0,
          scale: theme === "light" ? 0.8 : 1,
        }}
        transition={{ duration: 0.3, type: "spring" }}
        className="absolute"
      >
        <Moon className={`h-4 w-4 ${isPremiumUser ? "text-purple-400" : ""}`} />
      </motion.div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
