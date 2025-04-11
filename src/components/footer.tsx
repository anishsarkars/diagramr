
import { Link } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Linkedin } from "lucide-react";
import PolicyMenu from "./policy-menu";
import { useIsMobile } from "@/hooks/use-mobile";

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
          <a 
            href="https://www.linkedin.com/in/anishsarkar-/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors 
                        border border-primary/20 text-primary text-xs font-medium shadow-sm 
                        ${isMobile ? 'scale-75 origin-right' : ''}`}
          >
            <Linkedin className="h-3 w-3" />
            <span>Built by Anish</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
