
import { useState } from "react";
import { DiagramrLogo } from "./diagramr-logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Sun, Moon, Search, PlusCircle, Settings, User, Menu, X } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 py-3"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container flex items-center justify-between">
        <DiagramrLogo />
        
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            <span>Explore</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create</span>
          </Button>
          
          <div className="h-6 w-px bg-border/50 mx-2" />
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="rounded-full ml-2 gap-2">
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {isMenuOpen && (
          <motion.div 
            className="absolute top-full left-0 right-0 bg-background border-b border-border/50 py-4 px-6 md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" className="justify-start gap-2">
                <Search className="h-4 w-4" />
                <span>Explore</span>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create</span>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
              
              <div className="h-px bg-border/50 my-2" />
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="justify-start gap-2"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
