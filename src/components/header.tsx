
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-context";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetFooter, 
  SheetClose
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, LogOut, Menu, Sparkles, Crown, User as UserIcon } from "lucide-react";
import { useAccess } from "./access-context";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isPremiumUser } = useAccess();
  
  const isActive = (path: string) => pathname === path;
  
  useEffect(() => {
    const scrollHandler = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 1).toUpperCase();
  };
  
  // Navigation items including conditional upgrade/pricing label
  const navItems = [
    { label: "Home", href: "/" },
    { label: user ? "Upgrade" : "Pricing", href: "/pricing" },
    ...(user ? [{ label: "My Diagrams", href: "/liked" }] : []),
  ];
  
  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-200 h-16 lg:h-20",
      scrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
    )}>
      <div className="container flex justify-between items-center h-full">
        <Link to="/" className="flex items-center gap-2">
          <DiagramrLogo size="sm" />
          {isPremiumUser && (
            <Crown className="h-4 w-4 text-amber-400" />
          )}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                item.label === "Upgrade" && isPremiumUser ? "flex items-center gap-1 text-purple-400 hover:text-purple-300" : ""
              )}
            >
              {item.label}
              {item.label === "Upgrade" && isPremiumUser && <Sparkles className="h-3.5 w-3.5" />}
            </Link>
          ))}
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar className={`h-8 w-8 border ${isPremiumUser ? "border-purple-400/30" : "border-border"}`}>
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className={isPremiumUser ? "bg-purple-600/10 text-purple-400" : ""}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/liked")}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Saved Diagrams</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default" 
              size="sm" 
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          )}
        </nav>
        
        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="ghost">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <DiagramrLogo size="sm" />
                  {isPremiumUser && <Crown className="h-4 w-4 text-amber-400" />}
                </SheetTitle>
                <SheetDescription>
                  {isPremiumUser ? "Exclusive beta access" : "Diagramr Beta"}
                </SheetDescription>
              </SheetHeader>
              <div className="py-8 flex flex-col space-y-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
                        isActive(item.href) 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground",
                        item.label === "Upgrade" && isPremiumUser ? "flex items-center gap-1 text-purple-400" : ""
                      )}
                    >
                      {item.label}
                      {item.label === "Upgrade" && isPremiumUser && <Sparkles className="h-3.5 w-3.5" />}
                    </Link>
                  </SheetClose>
                ))}
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link
                        to="/account"
                        className="text-sm font-medium px-2 py-1.5 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        Account Settings
                      </Link>
                    </SheetClose>
                    <Button variant="outline" onClick={handleSignOut} className="mt-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
              <SheetFooter>
                {!user && (
                  <SheetClose asChild>
                    <Button onClick={() => navigate("/auth")} className="w-full">
                      Sign In
                    </Button>
                  </SheetClose>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
