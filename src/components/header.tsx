
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { 
  Search, 
  Menu, 
  X, 
  LogIn, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Bookmark, 
  Heart, 
  Settings,
  BadgeCheck
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <DiagramrLogo size="sm" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
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
              to="/favorites"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/favorites"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Favorites
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
                    <span>Beta Tester</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/favorites')}>
                  <Bookmark className="mr-2 h-4 w-4 text-blue-500" />
                  <span>My Bookmarks</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/liked')}>
                  <Heart className="mr-2 h-4 w-4 text-rose-500" />
                  <span>Liked Diagrams</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                
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
        </nav>

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
            <Link
              to="/"
              className="block py-2 text-foreground/70 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="block py-2 text-foreground/70 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {user && (
              <>
                <Link
                  to="/favorites"
                  className="block py-2 text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark className="h-4 w-4 inline mr-2 text-blue-500" />
                  Bookmarks
                </Link>
                <Link
                  to="/liked"
                  className="block py-2 text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-4 w-4 inline mr-2 text-rose-500" />
                  Liked Diagrams
                </Link>
                <Link
                  to="/account"
                  className="block py-2 text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 inline mr-2 text-slate-500" />
                  Account Settings
                </Link>
              </>
            )}
            {user ? (
              <>
                <div className="py-2 text-sm font-medium flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span>Beta Tester</span>
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
              <Link 
                to="/auth" 
                className="w-full" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="default" className="w-full justify-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
