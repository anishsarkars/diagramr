
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { useAccess } from "@/components/access-context";
import { HeaderMenu } from "@/components/header-menu";
import { motion } from "framer-motion";

export function Header() {
  const { user } = useAuth();
  const { setShowAccessForm, isPremiumUser } = useAccess();

  const handleShowAccessModal = () => {
    setShowAccessForm(true);
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-40 w-full border-b ${
        isPremiumUser 
          ? "bg-background/90 backdrop-blur-lg border-purple-500/10" 
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
    >
      <div className="container flex h-14 items-center">
        <div className="flex items-center mr-4">
          <Link to="/" className="flex items-center space-x-2">
            <DiagramrLogo size="sm" />
          </Link>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-foreground/90 hover:text-foreground transition-colors">Home</Button>
            </Link>
            
            {user ? (
              <Link to={user ? "/liked" : "/auth?returnTo=/liked"}>
                <Button variant="ghost" size="sm" className="text-foreground/90 hover:text-foreground transition-colors">Liked</Button>
              </Link>
            ) : null}
            
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-foreground/90 hover:text-foreground transition-colors">
                {user ? "Upgrade" : "Pricing"}
              </Button>
            </Link>
          </nav>
          
          <ThemeToggle />
          
          <HeaderMenu onShowAccessModal={handleShowAccessModal} />
        </div>
      </div>
    </motion.header>
  );
}
