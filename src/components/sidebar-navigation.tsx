
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { 
  Home, 
  PenTool, 
  Heart, 
  History, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Lightbulb,
  User,
  FolderHeart
} from "lucide-react";
import { DiagramrLogo } from "./diagramr-logo";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

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
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-primary/10",
        active && "bg-primary/10 text-primary font-medium"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
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
  const { user, signOut } = useAuth();

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
        <Home className="h-4 w-4" />
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
        animate={isMobile ? { x: isMobileOpen ? 0 : -320 } : { width: collapsed ? 64 : 256 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={cn(
          "relative h-screen border-r border-border/30 bg-background",
          "flex flex-col overflow-hidden",
          mobileStyles
        )}
      >
        {collapseButton}
        
        <div className={cn(
          "flex items-center gap-2 p-4 border-b border-border/20",
          collapsed && !isMobile && "justify-center"
        )}>
          <DiagramrLogo size={collapsed && !isMobile ? "sm" : "xs"} />
          {!collapsed && <span className="font-semibold">Diagramr</span>}
        </div>
        
        <ScrollArea className="flex-1 overflow-auto px-3 py-4">
          <nav className="space-y-2">
            <SidebarItem 
              icon={<Home className="h-5 w-5" />} 
              label="Dashboard" 
              href="/dashboard" 
              active={location.pathname === "/dashboard"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />
            
            <SidebarItem 
              icon={<PenTool className="h-5 w-5" />} 
              label="New Diagram" 
              href="/new" 
              active={location.pathname === "/new"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />
            
            <SidebarItem 
              icon={<Heart className="h-5 w-5" />} 
              label="Liked Diagrams" 
              href="/liked" 
              active={location.pathname === "/liked"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />

            <SidebarItem 
              icon={<FolderHeart className="h-5 w-5" />} 
              label="Collections" 
              href="/collections" 
              active={location.pathname === "/collections"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />
            
            <SidebarItem 
              icon={<User className="h-5 w-5" />} 
              label="Account" 
              href="/account" 
              active={location.pathname === "/account"}
              collapsed={collapsed && !isMobile}
              onClick={() => isMobile && setIsMobileOpen(false)}
            />
          </nav>
          
          {!collapsed && (
            <div className="mt-8 space-y-4">
              <h3 className="px-3 text-xs font-medium text-muted-foreground">Resources</h3>
              <nav className="space-y-2">
                <SidebarItem 
                  icon={<HelpCircle className="h-5 w-5" />} 
                  label="Help & Support" 
                  href="/help" 
                  active={location.pathname === "/help"}
                  collapsed={collapsed && !isMobile}
                  onClick={() => isMobile && setIsMobileOpen(false)}
                />
                
                <SidebarItem 
                  icon={<Lightbulb className="h-5 w-5" />} 
                  label="Tips & Tutorials" 
                  href="/tutorials" 
                  active={location.pathname === "/tutorials"}
                  collapsed={collapsed && !isMobile}
                  onClick={() => isMobile && setIsMobileOpen(false)}
                />
              </nav>
            </div>
          )}
        </ScrollArea>
        
        <div className={cn(
          "p-4 border-t border-border/20",
          collapsed && !isMobile && "flex justify-center"
        )}>
          <Button
            variant="ghost"
            size={collapsed && !isMobile ? "icon" : "sm"}
            onClick={handleSignOut}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
