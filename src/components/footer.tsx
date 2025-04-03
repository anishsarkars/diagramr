import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { LinkedinIcon, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  // Skip footer on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  // More minimal footer for dashboard
  if (location.pathname === "/dashboard") {
    return (
      <footer className="border-t border-border/20 py-3 bg-background">
        <div className="container flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            © {currentYear} Diagramr
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center">
              <span className="flex items-center">
                Built with <Heart className="h-3 w-3 mx-1 text-primary" /> in Indore
              </span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <motion.footer 
      className="border-t border-border/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="container py-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -left-20 -bottom-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <Logo size="lg" iconOnly={false} showText className="lg:ml-0" />
            
            <p className="text-sm text-muted-foreground max-w-xs">
              Discover and generate beautiful diagrams for your educational needs. 
              Powered by AI to help you visualize complex concepts easily.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Built by Anish card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center items-center"
        >
          <a 
            href="https://www.linkedin.com/in/anishsarkar-/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="no-underline group relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center"
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              
              <Badge 
                variant="secondary" 
                className="relative flex items-center gap-3 py-2 px-5 shadow-sm backdrop-blur-[2px] bg-card/40 hover:bg-card/50 border-0 transition-all duration-500"
              >
                <motion.span 
                  className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-500"
                  initial={{ letterSpacing: "0em" }}
                  whileHover={{ letterSpacing: "0.02em" }}
                >
                  Built by @Anish
                </motion.span>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <LinkedinIcon className="h-4 w-4 text-[#0077B5]/70 group-hover:text-[#0077B5] transition-colors duration-500" />
                </motion.div>
              </Badge>
            </motion.div>
          </a>
        </motion.div>
        
        <div className="mt-6 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Diagramr. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
