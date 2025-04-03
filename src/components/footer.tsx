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
      <div className="container py-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -left-20 -bottom-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-6">
              <Logo size="sm" iconOnly={false} showText className="lg:ml-0" />
              
              <div className="flex gap-4 text-sm text-muted-foreground">
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Login
                </Link>
              </div>
            </div>
          </div>
          
          {/* Built by Anish card - moved to right side and made bigger */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                  className="relative flex items-center gap-4 py-3 px-6 shadow-sm backdrop-blur-[2px] bg-card/40 hover:bg-card/50 border-0 transition-all duration-500"
                >
                  <motion.span 
                    className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-500"
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
                    <LinkedinIcon className="h-5 w-5 text-[#0077B5]/70 group-hover:text-[#0077B5] transition-colors duration-500" />
                  </motion.div>
                </Badge>
              </motion.div>
            </a>
          </motion.div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Diagramr. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
