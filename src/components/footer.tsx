
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
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
      <div className="container py-12 relative overflow-hidden">
        {/* 3D Design Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -left-20 -bottom-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
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
            <h3 className="font-medium mb-4">Product</h3>
            <ul className="space-y-3">
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
              <li>
                <Badge variant="outline" className="text-xs px-1.5 py-0 rounded-sm">Coming Soon</Badge>
                <span className="text-sm text-muted-foreground ml-2">Custom Diagrams</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium mb-4">Theme</h3>
            <ThemeToggle variant="outline" />
            
            <div className="pt-4">
              <div className="bg-card p-4 rounded-lg border border-border/40 shadow-sm">
                <motion.div
                  className="flex items-center gap-2 mb-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Creator</Badge>
                  <h4 className="font-medium text-sm">Anish Sarkar</h4>
                </motion.div>
                <p className="text-xs text-muted-foreground mb-3">
                  Full Stack Developer & Designer passionate about creating beautiful, functional products.
                </p>
                <Button variant="default" size="sm" className="w-full gap-1.5" asChild>
                  <a href="https://www.linkedin.com/in/anishsarkar-/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-3.5 w-3.5" />
                    <span className="text-xs">Connect on LinkedIn</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Diagramr. Built with ❤️ by 
            <a 
              href="https://www.linkedin.com/in/anishsarkar-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/90 font-medium ml-1 inline-flex items-center gap-0.5"
            >
              @Anish <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </p>
          
          <div className="flex items-center gap-6">
            <motion.div 
              className="text-xs text-muted-foreground flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full"
              whileHover={{ y: -2 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              All systems operational
            </motion.div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
