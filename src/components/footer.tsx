
import { DiagramrLogo } from "./diagramr-logo";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer 
      className="border-t border-border/30 py-6 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <DiagramrLogo />
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2023 Diagramr
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
