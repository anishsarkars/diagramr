
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { 
  Heart, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  User,
  Search,
} from "lucide-react";
import { DiagramrLogo } from "./diagramr-logo";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon, label, href, active, collapsed, onClick }: SidebarItemProps) {
  const isMobile = useIsMobile();
  const content = (
    <Link 
      to={href} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
        "hover:bg-primary/5",
        active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
      )}
    >
      <div className="flex-shrink-0 text-current">{icon}</div>
      {!collapsed && <span className="text-sm">{label}</span>}
    </Link>
  );

  if (collapsed && !isMobile) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" align="center" className="border-border/30">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function SidebarNavigation() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user || !user.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Only show button on desktop
  const collapseButton = !isMobile && (
    <Button
      variant="ghost"
      size="icon"
      className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background shadow-md"
      onClick={() => setCollapsed(!collapsed)}
    >
      {collapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronLeft className="h-3 w-3" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );

  // Mobile toggle
  const mobileToggle = isMobile && (
    <Button
      variant="outline"
      size="sm"
      className="fixed left-4 top-4 z-50 rounded-full h-10 w-10 p-0 shadow-md"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <Search className="h-4 w-4" />
      )}
    </Button>
  );

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  
  // Make it fullscreen on mobile when open
  const mobileStyles = isMobile 
    ? isMobileOpen 
      ? "fixed inset-0 z-50 w-full" 
      : "hidden" 
    : sidebarWidth;

  return (
    <>
      {mobileToggle}
      <motion.aside
        initial={false}
        animate={isMobile ? { x: isMobileOpen ? 0 : -320 } : { width: collapsed ? 64 : 220 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={cn(
          "relative h-screen border-r border-border/10 bg-background",
          "flex flex-col overflow-hidden",
          mobileStyles
        )}
      >
        {collapseButton}
        
        <div className={cn(
          "flex items-center gap-2 p-4 border-b border-border/10",
          collapsed && !isMobile && "justify-center"
        )}>
          <DiagramrLogo size={collapsed && !isMobile ? "sm" : "xs"} />
          {!collapsed && <span className="font-semibold">Diagramr</span>}
        </div>
        
        <ScrollArea className="flex-1 overflow-auto px-3 py-6">
          <nav className="space-y-2">
            <SidebarItem 
              icon={<Heart className="h-5 w-5" />} 
              label="Liked Diagrams" 
              href="/liked" 
              active={location.pathname === "/liked"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />
            
            <SidebarItem 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              href="/account" 
              active={location.pathname === "/account"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />
          </nav>
        </ScrollArea>
        
        <div className={cn(
          "p-4 border-t border-border/10",
          !collapsed && "mx-3 mb-3 mt-auto rounded-lg bg-muted/30"
        )}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getUserInitial()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email || 'User'}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-xs p-0 h-6 text-muted-foreground hover:text-destructive"
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="w-full text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
