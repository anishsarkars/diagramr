
import { Link } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Linkedin, Sparkles } from "lucide-react";
import PolicyMenu from "./policy-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export function Footer() {
  const isMobile = useIsMobile();
  
  return (
    <footer className="border-t border-border/10 bg-background/80 backdrop-blur-sm py-4 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center">
            <DiagramrLogo size="sm" />
          </Link>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 sm:items-center text-xs sm:text-sm">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <div className="relative inline-block">
              <PolicyMenu />
            </div>
            <Link to="/auth" className="hover:text-foreground transition-colors">
              Login
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
          <div className="text-xs text-muted-foreground">
            © 2025 Diagramr. All rights reserved.
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="scale-90 sm:scale-100" // Make the badge larger (was scale-75 sm:scale-80)
          >
            <a 
              href="https://www.linkedin.com/in/anishsarkar-/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 transition-all duration-300 
                        border border-primary/30 text-primary font-medium shadow-md hover:shadow-lg text-xs"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span className="flex items-center gap-1">
                <span>Built by</span>
                <span className="font-semibold">Anish</span>
                <Sparkles className="h-3 w-3 text-amber-500" />
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
