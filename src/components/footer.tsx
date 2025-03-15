
import { Logo } from "@/components/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/40 py-6 md:py-0">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 md:h-16">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-8" iconOnly />
          <p className="text-sm text-muted-foreground">
            © {currentYear} Diagramr. All rights reserved.
          </p>
        </div>
        
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
