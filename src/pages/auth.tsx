
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

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();
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

        toast({
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

        toast({
          title: "Welcome back!",
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
      
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
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
          particleCount={50}
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
            <OAuthSignIn className="mb-4" />
            
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
