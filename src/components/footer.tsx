import { Link } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";

export function Footer() {
  return (
    <footer className="border-t border-border/10 bg-background/80 backdrop-blur-sm py-5 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/" className="flex items-center">
            <DiagramrLogo size="sm" />
          </Link>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">
              Login
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 Diagramr. All rights reserved.
          </div>
          <a 
            href="https://twitter.com/AnishDe12020" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 text-primary"
          >
            by <span className="font-medium">@Anish</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
