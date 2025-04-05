import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setIsNewLogin, refreshProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsProcessing(true);
        console.log("OAuth callback handler running");
        
        // If already have user, try to refresh profile and redirect
        if (user) {
          console.log("User already authenticated:", user);
          
          // Force profile refresh to ensure it's created
          await refreshProfile();
          
          // Set flag for celebration
          setIsNewLogin(true);
          
          // Redirect
          navigate("/dashboard");
          return;
        }

        // Check for auth code in URL
        const params = new URLSearchParams(location.search);
        
        if (params.has('error')) {
          // Handle error from OAuth provider
          const errorMsg = params.get('error_description') || params.get('error') || 'Authentication failed';
          setError(errorMsg);
          toast.error("Login failed", {
            description: errorMsg,
          });
          setTimeout(() => navigate("/auth"), 2000);
          return;
        }

        // Wait for Supabase to handle the OAuth callback
        // This usually happens automatically, but we want to ensure the profile is created
        console.log("Waiting for Supabase to exchange auth code");
        
        // Small delay to let Supabase handle auth
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          throw new Error("No session after OAuth callback");
        }
        
        console.log("Session retrieved:", session ? "has session" : "no session");
        
        // Force setting new login flag
        setIsNewLogin(true);
        
        // Successfully authenticated, redirect to dashboard
        toast.success("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("OAuth callback error:", error);
        setError("Authentication failed. Please try again.");
        toast.error("Login failed", {
          description: "Something went wrong during authentication. Please try again.",
        });
        
        // Redirect back to auth page
        setTimeout(() => navigate("/auth"), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, location, user, setIsNewLogin, refreshProfile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        {isProcessing ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-semibold mb-2">Completing your login...</h1>
            <p className="text-muted-foreground">Please wait while we finish setting up your account.</p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-semibold mb-2 text-destructive">Login Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p>Redirecting you back to login...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-2 text-primary">Login Successful!</h1>
            <p className="text-muted-foreground">Redirecting you to the dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
} 