
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Search, Menu, X, LogIn, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

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
            <DiagramrLogo className="h-7 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground/80",
              location.pathname === "/"
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Home
          </Link>
          {profile?.is_premium && (
            <Link
              to="/favorites"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                location.pathname === "/favorites"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Favorites
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  {profile?.username || user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="font-medium">
                    Plan: {profile?.is_premium ? 'Premium' : 'Free'}
                  </span>
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
              <Button size="sm" variant="ghost" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container p-4 space-y-4">
            <Link
              to="/"
              className="block py-2 text-foreground/70 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {profile?.is_premium && (
              <Link
                to="/favorites"
                className="block py-2 text-foreground/70 hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites
              </Link>
            )}
            {user ? (
              <>
                <div className="py-2 text-sm text-muted-foreground">
                  {profile?.username || user.email}
                </div>
                <div className="py-2 text-sm font-medium">
                  Plan: {profile?.is_premium ? 'Premium' : 'Free'}
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
        </div>
      )}
    </header>
  );
}
