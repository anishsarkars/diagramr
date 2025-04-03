
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, ExternalLink, Heart } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  // Skip footer on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <motion.footer 
      className="border-t border-border/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="container py-8 relative overflow-hidden">
        {/* 3D Design Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -left-20 -bottom-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <Logo size="lg" iconOnly={false} showText className="lg:ml-0" />
            
            <p className="text-sm text-muted-foreground max-w-xs">
              Find and generate high-quality diagrams for education, business, 
              and technical documentation.
            </p>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                <a href="https://twitter.com/anish_designer" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                <a href="https://github.com/Anish-Karthik" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-md">
                <a href="https://www.linkedin.com/in/anishsarkar-/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Search Diagrams
                </a>
              </li>
              <li>
                <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Generate with AI
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium mb-3">Theme</h3>
            <ThemeToggle variant="outline" />
            
            <div className="pt-2">
              <motion.div
                className="bg-card p-4 rounded-lg border border-border/40 shadow-sm"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Creator</Badge>
                  <h4 className="font-medium text-sm">Anish Sarkar</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Idea to MVP, Explorer, Student, From Indore
                </p>
                <Button variant="default" size="sm" className="w-full gap-1.5" asChild>
                  <a href="https://www.linkedin.com/in/anishsarkar-/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-3.5 w-3.5" />
                    <span className="text-xs">Connect on LinkedIn</span>
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.p 
            className="text-sm text-muted-foreground flex items-center gap-1"
            whileHover={{ color: "#F87171" }}
          >
            © {currentYear} Diagramr. Built with 
            <span className="inline-flex items-center">
              <Heart className="h-3 w-3 text-red-400 animate-pulse" />
            </span>
            <span className="font-medium"> in Indore </span>
            by 
            <a 
              href="https://www.linkedin.com/in/anishsarkar-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/90 font-medium ml-1 inline-flex items-center gap-0.5"
            >
              @Anish <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </motion.p>
          
          <motion.div 
            className="text-xs text-muted-foreground flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full"
            whileHover={{ y: -2 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            All systems operational
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}
