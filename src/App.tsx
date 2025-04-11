import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth-context";
import { AccessProvider } from "@/components/access-context";
import { useState, useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Liked from "./pages/Liked";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import { SiteLoader } from "./components/site-loader";
import { FeedbackButton } from "./components/feedback-button";
import ChatDashboard from "./pages/ChatDashboard";
import { LoginConfetti } from "./components/login-confetti";
import { PaymentSuccessNotification } from "./components/payment-success-notification";

// Lazy load admin pages
const AdminApiStatus = lazy(() => import('./pages/admin/api-status'));

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guestSearchCount, setGuestSearchCount] = useState(0);
  
  // Add loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to check if user is admin
  const isAdmin = () => {
    // In a real app, this would check the user's role/permissions
    // For now, we'll consider certain emails as admins
    const adminEmails = ['admin@diagramr.com']; // Add your admin emails here
    return user && user.email && adminEmails.includes(user.email);
  };

  // Protected route handler
  useEffect(() => {
    const protectedRoutes = ['/account', '/liked', '/dashboard'];
    const adminRoutes = ['/admin/api-status'];
    
    console.log("Route change detected:", location.pathname, "User:", user?.email || "not logged in");
    
    // Check if the route is protected and user is not logged in
    if (protectedRoutes.includes(location.pathname) && !user) {
      console.log("Protected route accessed without authentication, redirecting to auth");
      navigate('/auth', { state: { returnTo: location.pathname } });
      return;
    }
    
    // Check if route is admin-only and user is not an admin
    if (adminRoutes.some(route => location.pathname.startsWith(route)) && !isAdmin()) {
      console.log("Admin route accessed by non-admin, redirecting to home");
      navigate('/');
      return;
    }

    // Redirect logged-in users from homepage or auth page to dashboard
    if (user && (location.pathname === '/' || location.pathname === '/auth')) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [location.pathname, user, navigate]);

  useEffect(() => {
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
        <div className="top-glow header-spacing relative min-h-screen bg-transparent overflow-x-hidden">
          {/* Confetti will automatically show when user logs in */}
          <LoginConfetti />
          {/* Handle payment success notifications */}
          <PaymentSuccessNotification />
          <Toaster />
          <Sonner closeButton position="top-right" />
          <Routes>
            <Route path="/" element={<Index onLoginClick={handleLoginClick} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/account" element={<Account />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/dashboard" element={<ChatDashboard />} />
            <Route path="/admin/api-status" element={
              <Suspense fallback={<SiteLoader />}>
                <AdminApiStatus />
              </Suspense>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackButton />
        </div>
      )}
    </>
  );
}

const App = () => {
  const savedTheme = localStorage.getItem("diagramr-theme");
  
  // Use the saved theme or default to light
  const defaultTheme = (savedTheme === "dark" || savedTheme === "light") ? savedTheme : "light";
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={defaultTheme as any} storageKey="diagramr-theme">
        <AuthProvider onLogout={() => {
          // Redirect to home page after logout
          window.location.href = '/';
        }}>
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
