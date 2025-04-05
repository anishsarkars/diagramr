import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { toast } from "sonner";
import { BadgeLayout } from "@/components/badge-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Loader2 } from "lucide-react";
import { OAuthSignIn } from "@/components/oauth-sign-in";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setIsNewLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  
  const returnTo = location.state?.returnTo || "/dashboard";

  useEffect(() => {
    // Check if the URL has a signup parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("signup") === "true") {
      setIsSignUp(true);
    }
    
    // Redirect if already authenticated
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate inputs
      const result = authSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        setIsSubmitting(false);
        return;
      }
      
      setValidationErrors({});
      
      // Use supabase auth methods
      const { supabase } = await import("@/integrations/supabase/client");
      
      if (isSignUp) {
        console.log("Starting sign up process");
        // Handle sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/dashboard'
          }
        });
        
        console.log("Sign up response:", data, error);
        
        if (error) throw error;
        
        if (data.user) {
          // Create profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: email.split('@')[0],
              avatar_url: null,
              is_premium: false
            });
            
          if (profileError) console.error("Profile creation error:", profileError);
          
          // Check if email confirmation is required
          if (data.session) {
            // User is already confirmed and signed in
            console.log("User authenticated immediately after signup");
            
            // Set the new login flag to trigger confetti
            setIsNewLogin(true);
            toast.success("Account created successfully! Welcome to Diagramr!");
            
            // Delay navigation slightly to allow confetti to appear
            setTimeout(() => {
              navigate('/dashboard');
            }, 300);
          } else {
            // Email confirmation required
            console.log("Email confirmation required");
            toast.success("Account created! Please check your email to confirm your registration.");
          }
        }
      } else {
        console.log("Starting sign in process");
        // Handle sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        console.log("Sign in response:", data, error);
        
        if (error) throw error;
        
        // Set flag to trigger confetti through auth-context
        setIsNewLogin(true);
        toast.success("Welcome back to Diagramr!");
        
        // Navigate to the destination
        navigate(returnTo, { replace: true });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-8">
        <Card className="w-[400px] max-w-[90%] shadow-xl">
          <CardHeader className="space-y-1 flex items-center">
            <div className="w-full flex justify-center mb-4">
              <DiagramrLogo className="h-10 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center font-serif">
              {isSignUp ? "Create an account" : "Sign in to Diagramr"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground/90">
              {isSignUp 
                ? "Create your Diagramr account to start finding amazing diagrams" 
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={!!validationErrors.email}
                    className="bg-white/80 dark:bg-gray-950/80 shadow-sm border-gray-200 dark:border-gray-800"
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-invalid={!!validationErrors.password}
                    className="bg-white/80 dark:bg-gray-950/80 shadow-sm border-gray-200 dark:border-gray-800"
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : (
                    <>{isSignUp ? "Create Account" : "Sign In"}</>
                  )}
                </Button>
              </form>
            </div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground/90">Or continue with</span>
              </div>
            </div>
            
            <OAuthSignIn 
              isLoading={isOAuthLoading}
              onGoogleLogin={async () => {
                try {
                  setIsOAuthLoading(true);
                  const { supabase } = await import("@/integrations/supabase/client");
                  
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin + '/dashboard'
                    }
                  });
                  
                  if (error) throw error;
                  
                  // Set flag to trigger confetti on successful redirect back
                  setIsNewLogin(true);
                  
                  // The redirect happens automatically through Supabase OAuth
                } catch (error) {
                  console.error("Google login error:", error);
                  toast.error("Google login failed. Please try again.");
                } finally {
                  setIsOAuthLoading(false);
                }
              }}
              onLinkedInLogin={async () => {
                try {
                  setIsOAuthLoading(true);
                  const { supabase } = await import("@/integrations/supabase/client");
                  
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'linkedin',
                    options: {
                      redirectTo: window.location.origin + '/dashboard'
                    }
                  });
                  
                  if (error) throw error;
                  
                  // Set flag to trigger confetti on successful redirect back
                  setIsNewLogin(true);
                  
                  // The redirect happens automatically through Supabase OAuth
                } catch (error) {
                  console.error("LinkedIn login error:", error);
                  toast.error("LinkedIn login failed. Please try again.");
                } finally {
                  setIsOAuthLoading(false);
                }
              }}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              {isSignUp ? (
                <div>
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign in
                  </Button>
                </div>
              ) : (
                <div>
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => setIsSignUp(true)}
                  >
                    Create one
                  </Button>
                </div>
              )}
            </div>
            
            {!isSignUp && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-muted-foreground/90 font-normal"
                onClick={() => navigate("/reset-password")}
              >
                Forgot password?
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
