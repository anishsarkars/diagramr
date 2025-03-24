
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { useAccess } from "@/components/access-context";
import { HeaderMenu } from "@/components/header-menu";

export function Header() {
  const { user } = useAuth();
  const { setShowAccessForm, isPremiumUser } = useAccess();

  const handleShowAccessModal = () => {
    setShowAccessForm(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center mr-4">
          <Link to="/" className="flex items-center space-x-2">
            <DiagramrLogo size="sm" />
            <span className={`font-bold ${isPremiumUser ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600" : ""}`}>Diagramr</span>
          </Link>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            
            {user ? (
              <Link to={user ? "/liked" : "/auth?returnTo=/liked"}>
                <Button variant="ghost" size="sm">Liked</Button>
              </Link>
            ) : null}
            
            <Link to={user ? "/pricing" : "/auth?returnTo=/pricing"}>
              <Button variant="ghost" size="sm">
                {user ? "Upgrade" : "Pricing"}
              </Button>
            </Link>
          </nav>
          
          <ThemeToggle />
          
          <HeaderMenu onShowAccessModal={handleShowAccessModal} />
        </div>
      </div>
    </header>
  );
}
