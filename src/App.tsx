import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth-context";
import { AccessProvider } from "@/components/access-context";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Liked from "./pages/Liked";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { SiteLoader } from "./components/site-loader";
import { FeedbackButton } from "./components/feedback-button";
import ChatDashboard from "./pages/ChatDashboard";
import { ConfettiCelebration } from "./components/confetti-celebration";
import { AuthDialog } from "@/components/auth-dialog";

// Create a query client with better retry settings for failed API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// App content separated to use router hooks
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<"welcome" | "searches-exhausted">("welcome");
  const [guestSearchCount, setGuestSearchCount] = useState(0);
  const MAX_GUEST_SEARCHES = 3;
  
  // Enhanced loading timeout for better UX
  useEffect(() => {
    // Check if user has already visited
    const hasVisited = localStorage.getItem("hasVisited");
    
    // Simulate loading time for first-time visitors
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!hasVisited) {
        localStorage.setItem("hasVisited", "true");
      }
    }, hasVisited ? 500 : 1500); // Shorter initial load for better UX
    
    return () => clearTimeout(timer);
  }, []);

  // Protected route handler
  useEffect(() => {
    const protectedRoutes = ['/account', '/liked', '/dashboard'];
    
    // Check if the route is protected and user is not logged in
    if (protectedRoutes.includes(location.pathname) && !user) {
      navigate('/auth', { state: { returnTo: location.pathname } });
      return;
    }
    
    // Show login success celebration when user logs in and goes to dashboard
    if (user && location.pathname === '/dashboard' && !showLoginSuccess) {
      const lastLogin = localStorage.getItem('last-login-celebration');
      const now = Date.now();
      
      // Only show celebration if it hasn't been shown in the last hour
      if (!lastLogin || now - parseInt(lastLogin) > 60 * 60 * 1000) {
        setShowLoginSuccess(true);
        localStorage.setItem('last-login-celebration', now.toString());
        
        // Auto-hide after animation
        setTimeout(() => {
          setShowLoginSuccess(false);
        }, 2000);
      }
    }
  }, [location.pathname, user, navigate, showLoginSuccess]);

  useEffect(() => {
    // Check if it's the first visit
    const hasVisited = localStorage.getItem('diagramr-visited');
    if (!hasVisited && !user) {
      localStorage.setItem('diagramr-visited', 'true');
      setAuthDialogMode("welcome");
      setShowAuthDialog(true);
    }

    // Load guest search count
    const savedCount = localStorage.getItem('diagramr-guest-searches');
    if (savedCount) {
      setGuestSearchCount(parseInt(savedCount));
    }
  }, [user]);

  // Function to increment search count
  const incrementSearchCount = () => {
    if (!user) {
      const newCount = guestSearchCount + 1;
      setGuestSearchCount(newCount);
      localStorage.setItem('diagramr-guest-searches', newCount.toString());

      if (newCount >= MAX_GUEST_SEARCHES) {
        setAuthDialogMode("searches-exhausted");
        setShowAuthDialog(true);
      }
    }
  };

  const handleLoginClick = () => {
    navigate('/auth', { 
      state: { returnTo: location.pathname !== '/auth' ? location.pathname : '/' } 
    });
  };
  
  return (
    <>
      {isLoading ? (
        <SiteLoader />
      ) : (
        <>
          {showLoginSuccess && <ConfettiCelebration duration={2000} particleCount={30} />}
          <Toaster />
          <Sonner closeButton position="top-right" />
          <Routes>
            <Route path="/" element={<Index onLoginClick={handleLoginClick} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/account" element={<Account />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<ChatDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackButton />
          <AuthDialog 
            isOpen={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
            mode={authDialogMode}
          />
        </>
      )}
    </>
  );
}

const App = () => {
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("diagramr-theme");
  
  // Define the Theme type
  type Theme = "light" | "dark" | "system";
  
  // Ensure savedTheme is properly cast to a valid Theme type
  const defaultTheme: Theme = (savedTheme as Theme) || (prefersDarkMode ? "dark" : "light");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={defaultTheme} storageKey="diagramr-theme">
        <AuthProvider>
          <AccessProvider>
            <TooltipProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </AccessProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
