
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { OAuthSignIn } from "@/components/oauth-sign-in";
import { useAuth } from "@/components/auth-context";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { toast } from "sonner";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const returnTo = location.state?.returnTo || "/dashboard";

  useEffect(() => {
    if (user) {
      // If user is already logged in, show celebration and redirect
      setShowCelebration(true);
      // Wait for confetti to finish before redirecting
      const timer = setTimeout(() => {
        navigate(returnTo);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate, returnTo]);

  // Add Google login handler
  const handleGoogleLogin = async () => {
    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Google login failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsOAuthLoading(false);
    }
  };

  // Handle LinkedIn login
  const handleLinkedInLogin = async () => {
    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("LinkedIn login error:", error);
      toast.error("LinkedIn login failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;

      if (isSignUp) {
        // Sign up
        result = await supabase.auth.signUp({
          email,
          password,
        });

        if (result.error) throw result.error;

        toastHook({
          title: "Account created!",
          description: "Check your email to verify your account.",
        });
      } else {
        // Sign in
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) throw result.error;

        toast.success("Welcome back!", {
          description: "You've successfully signed in.",
        });

        // Show the celebration effect
        setShowCelebration(true);
      }

    } catch (error: any) {
      console.error("Authentication error:", error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error.message) {
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account";
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("User already registered")) {
          errorMessage = "Email already in use. Try signing in instead";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error("Authentication failed", {
        description: errorMessage,
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {showCelebration && (
        <ConfettiCelebration 
          duration={1500}
          particleCount={30}
          onComplete={() => {
            // Redirect after celebration is complete
            navigate(returnTo);
          }}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/30 shadow-md">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <DiagramrLogo size="md" className="mb-2" />
            <CardTitle className="text-2xl font-semibold text-center">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp
                ? "Sign up to save and access your favorite diagrams"
                : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                disabled={isOAuthLoading}
                className="w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="mr-2 h-5 w-5"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Google
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleLinkedInLogin}
                disabled={isOAuthLoading}
                className="w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-5 w-5 fill-[#0A66C2]"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                  </div>
                ) : (
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm">
              {isSignUp ? (
                <div>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="underline text-primary hover:text-primary/90 font-medium transition-colors"
                    type="button"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="underline text-primary hover:text-primary/90 font-medium transition-colors"
                    type="button"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
