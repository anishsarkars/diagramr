import { useState, useEffect, useCallback } from "react";
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
import { ConfettiCelebration } from "@/components/confetti-celebration";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const returnTo = location.state?.returnTo || "/dashboard";

  // Helper function for showing confetti and navigating after delay
  const showConfettiAndNavigate = useCallback((destination: string, message: string) => {
    setShowConfetti(true);
    toast.success(message);
    
    // Give time for confetti to show before navigating
    setTimeout(() => {
      navigate(destination, { replace: true });
    }, 1500); // Increased delay to ensure confetti is visible
  }, [navigate]);

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
            showConfettiAndNavigate('/dashboard', "Account created successfully! Welcome to Diagramr!");
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
        
        showConfettiAndNavigate(returnTo, "Welcome back to Diagramr!");
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
    <BadgeLayout>
      {showConfetti && <ConfettiCelebration duration={3000} particleCount={150} />}
      <div className="p-4">
        <Card className="w-full shadow-lg border-opacity-40 bg-card/95 backdrop-blur-sm dark:shadow-2xl dark:border-gray-800/50">
          <CardHeader className="space-y-1 flex items-center">
            <div className="w-full flex justify-center mb-4">
              <DiagramrLogo className="h-10 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center font-serif">
              {isSignUp ? "Create an account" : "Sign in to Diagramr"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground/90">
              {isSignUp 
                ? "Create your Diagramr account to start finding amazing diagrams. You'll be asked to set your name after signup." 
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
                  
                  // Show confetti first before OAuth redirect
                  setShowConfetti(true);
                  
                  // Small delay to allow confetti to be visible before redirect
                  await new Promise(resolve => setTimeout(resolve, 800));
                  
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin + '/dashboard'
                    }
                  });
                  
                  if (error) throw error;
                  
                  // The redirect happens automatically, so we don't need to navigate
                } catch (error) {
                  console.error("Google login error:", error);
                  toast.error("Google login failed. Please try again.");
                  setShowConfetti(false);
                } finally {
                  setIsOAuthLoading(false);
                }
              }}
              onLinkedInLogin={async () => {
                try {
                  setIsOAuthLoading(true);
                  const { supabase } = await import("@/integrations/supabase/client");
                  
                  // Show confetti first before OAuth redirect
                  setShowConfetti(true);
                  
                  // Small delay to allow confetti to be visible before redirect
                  await new Promise(resolve => setTimeout(resolve, 800));
                  
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'linkedin',
                    options: {
                      redirectTo: window.location.origin + '/dashboard'
                    }
                  });
                  
                  if (error) throw error;
                  
                  // The redirect happens automatically, so we don't need to navigate
                } catch (error) {
                  console.error("LinkedIn login error:", error);
                  toast.error("LinkedIn login failed. Please try again.");
                  setShowConfetti(false);
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
                  <Button variant="link" className="p-0 font-medium" onClick={() => setIsSignUp(false)}>
                    Sign in
                  </Button>
                </div>
              ) : (
                <div>
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0 font-medium" onClick={() => setIsSignUp(true)}>
                    Create account
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-center text-xs text-muted-foreground/80">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </div>
          </CardFooter>
        </Card>
      </div>
    </BadgeLayout>
  );
}
