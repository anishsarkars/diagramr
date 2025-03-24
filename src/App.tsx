
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth-context";
import { AccessProvider, useAccess } from "@/components/access-context";
import { useState, useEffect, Suspense, lazy } from "react";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Liked from "./pages/Liked";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { SiteLoader } from "./components/site-loader";
import { AccessCodeModal } from "./components/access-code-modal";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { accessStatus, setShowAccessForm, hasValidAccessCode, isPremiumUser } = useAccess();
  
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
    }, hasVisited ? 500 : 1800); // Longer initial load for better impression
    
    return () => clearTimeout(timer);
  }, []);

  // Protected route handler
  useEffect(() => {
    const protectedRoutes = ['/account', '/liked'];
    
    // Check if the route is protected and user is not logged in
    if (protectedRoutes.includes(location.pathname) && !user) {
      navigate('/auth', { state: { returnTo: location.pathname } });
      return;
    }
    
    // Only show access code modal for signup attempt on the auth page
    // or if the user is trying to explicitly access restricted content without a valid code
    const isAuthPage = location.pathname === '/auth';
    const isSignupAttempt = isAuthPage && location.search.includes('signup=true');
    const needsAccessForProtectedContent = !hasValidAccessCode && 
      (location.pathname === '/pricing' || 
       location.pathname === '/account' || 
       location.pathname === '/liked');
    
    if ((isSignupAttempt || needsAccessForProtectedContent) && accessStatus === 'unauthorized') {
      setShowAccessForm(true);
    }
  }, [location.pathname, location.search, user, navigate, accessStatus, setShowAccessForm, hasValidAccessCode]);

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
          <Toaster />
          <Sonner closeButton position="top-right" />
          <AccessCodeModal />
          <Routes>
            <Route path="/" element={<Index onLoginClick={handleLoginClick} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/account" element={<Account />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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
