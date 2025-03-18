
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Menu, 
  X, 
  LogIn, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Heart, 
  Settings,
  BadgeCheck,
  Home,
  CreditCard
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { useTheme } from "./theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Logo } from "./logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleScroll = () => {
    const offset = window.scrollY;
    setScrolled(offset > 10);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Default to light mode on initial load
    if (!theme || theme === 'system') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success("Signed out successfully");
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled ? "bg-background/90 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" className="h-12 w-auto" showBeta={false} />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:flex items-center gap-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            to="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/"
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Home
          </Link>
          
          <Link
            to="/pricing"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/pricing"
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Pricing
          </Link>
          
          {user && (
            <Link
              to="/liked"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/liked"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Liked
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="mr-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {profile?.username || user.email}
                  <div className="text-xs font-normal text-muted-foreground mt-1 flex items-center">
                    <BadgeCheck className="h-3 w-3 mr-1 text-primary" />
                    <span>{profile?.is_premium ? "Premium" : "Free Account"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/liked')}>
                  <Heart className="mr-2 h-4 w-4 text-rose-500" />
                  <span>Liked Diagrams</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                
                {!profile?.is_premium && (
                  <DropdownMenuItem onClick={() => navigate('/pricing')}>
                    <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                    <span>Upgrade to Premium</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="default" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </Button>
            </Link>
          )}
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
          
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden border-t border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container p-4 space-y-4">
            <button
              className="flex items-center w-full py-2 text-foreground/70 hover:text-foreground"
              onClick={() => handleMenuClick('/')}
            >
              <Home className="h-4 w-4 inline mr-2" />
              Home
            </button>
            
            <button
              className="flex items-center w-full py-2 text-foreground/70 hover:text-foreground"
              onClick={() => handleMenuClick('/pricing')}
            >
              <CreditCard className="h-4 w-4 inline mr-2" />
              Pricing
            </button>
            
            {user && (
              <>
                <button
                  className="flex items-center w-full py-2 text-foreground/70 hover:text-foreground"
                  onClick={() => handleMenuClick('/liked')}
                >
                  <Heart className="h-4 w-4 inline mr-2 text-rose-500" />
                  Liked Diagrams
                </button>
                
                <button
                  className="flex items-center w-full py-2 text-foreground/70 hover:text-foreground"
                  onClick={() => handleMenuClick('/account')}
                >
                  <Settings className="h-4 w-4 inline mr-2 text-slate-500" />
                  Account Settings
                </button>
              </>
            )}
            
            {user ? (
              <>
                <div className="py-2 text-sm font-medium flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span>{profile?.is_premium ? "Premium Account" : "Free Account"}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                className="w-full justify-center"
                onClick={() => handleMenuClick('/auth')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
