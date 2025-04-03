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
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

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

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        console.error("Google login error:", error);
        toast.error("We're working on it!", {
          description: "We're constantly improving. Please try again in a few moments.",
          action: {
            label: "Try Again",
            onClick: () => handleGoogleLogin()
          }
        });
        return;
      }
      
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("We're working on it!", {
        description: "We're constantly improving. Please try again in a few moments.",
        action: {
          label: "Try Again",
          onClick: () => handleGoogleLogin()
        }
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
          options: {
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });

        if (result.error) {
          console.error("Sign up error:", result.error);
          if (result.error.message.includes("User already registered")) {
            toast.error("Account already exists", {
              description: "Try signing in instead, or use a different email.",
              action: {
                label: "Sign In",
                onClick: () => setIsSignUp(false)
              }
            });
          } else {
            toast.error("We're working on it!", {
              description: "We're constantly improving. Please try again in a few moments.",
              action: {
                label: "Try Again",
                onClick: () => handleSubmit(e)
              }
            });
          }
          return;
        }

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

        if (result.error) {
          console.error("Sign in error:", result.error);
          if (result.error.message.includes("Invalid login credentials")) {
            toast.error("Invalid credentials", {
              description: "Please check your email and password.",
              action: {
                label: "Try Again",
                onClick: () => handleSubmit(e)
              }
            });
          } else if (result.error.message.includes("Email not confirmed")) {
            toast.error("Email not verified", {
              description: "Please check your email for the verification link.",
              action: {
                label: "Resend Email",
                onClick: async () => {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                  });
                  if (!error) {
                    toast.success("Verification email sent!");
                  }
                }
              }
            });
          } else {
            toast.error("We're working on it!", {
              description: "We're constantly improving. Please try again in a few moments.",
              action: {
                label: "Try Again",
                onClick: () => handleSubmit(e)
              }
            });
          }
          return;
        }

        toast.success("Welcome back!", {
          description: "You've successfully signed in.",
        });

        // Show the celebration effect
        setShowCelebration(true);
      }

    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error("We're working on it!", {
        description: "We're constantly improving. Please try again in a few moments.",
        action: {
          label: "Try Again",
          onClick: () => handleSubmit(e)
        }
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
            <OAuthSignIn />
            
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>{isSignUp ? "Create Account" : "Sign In"}</>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? (
                <>Already have an account? Sign in</>
              ) : (
                <>Don't have an account? Sign up</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
