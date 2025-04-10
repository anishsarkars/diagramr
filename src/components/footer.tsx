import { Link } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Linkedin } from "lucide-react";
import PolicyMenu from "./policy-menu";

export function Footer() {
  return (
    <footer className="border-t border-border/10 bg-background/80 backdrop-blur-sm py-5 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/" className="flex items-center">
            <DiagramrLogo size="sm" />
          </Link>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
            <Link to="/" className="hover:text-foreground transition-colors text-sm">
              Home
            </Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors text-sm">
              Pricing
            </Link>
            <div className="relative inline-block">
              <PolicyMenu />
            </div>
            <Link to="/auth" className="hover:text-foreground transition-colors text-sm">
              Login
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 Diagramr. All rights reserved.
          </div>
          <a 
            href="https://www.linkedin.com/in/anishsarkar-/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 text-primary font-medium shadow-sm"
          >
            <Linkedin className="h-3.5 w-3.5" />
            <span>Built by Anish</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
