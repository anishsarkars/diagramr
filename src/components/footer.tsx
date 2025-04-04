import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Heart, ExternalLink, Github, Twitter, Sparkles, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  // Skip footer on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-sm pb-safe">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="flex flex-col gap-4">
            <DiagramrLogo size="md" />
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered diagram search for students, teachers, and professionals.
              Find the perfect diagrams for your projects instantly.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Links</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://diagramr.com/about" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="https://diagramr.com/privacy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://diagramr.com/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="https://diagramr.com/contact" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Creator</h3>
            <motion.div 
              className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-4 shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                borderColor: "rgba(var(--primary), 0.3)"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-50"></div>
              <div className="absolute top-0 right-0">
                <div className="w-24 h-24 rounded-full bg-primary/10 blur-3xl opacity-30 transform translate-x-8 -translate-y-8"></div>
              </div>
              
              <div className="relative flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/30">
                    <img
                      src="https://avatars.githubusercontent.com/u/80917940?v=4"
                      alt="Anish"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-1">
                      Anish
                      <Sparkles className="h-3.5 w-3.5 text-primary ml-0.5" />
                    </h4>
                    <p className="text-xs text-muted-foreground">Full Stack Developer</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground/90 my-1">
                  Built with <span className="inline-flex items-center mx-0.5"><Heart className="h-3 w-3 text-red-500 fill-red-500 mx-0.5" /></span> using React, Supabase & AI.
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href="https://github.com/anishsrinivasan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://twitter.com/anishsrinivasan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://anishsrinivasan.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 gap-1 text-xs hover:bg-primary/10 hover:text-primary"
                    >
                      <Code className="h-3 w-3" />
                      Portfolio
                      <ExternalLink className="h-3 w-3 ml-0.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Diagramr. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/anishsrinivasan/diagramr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a 
              href="https://twitter.com/getdiagramr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
