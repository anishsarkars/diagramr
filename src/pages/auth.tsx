
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OAuthSignIn } from "@/components/oauth-sign-in";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAccess } from '@/components/access-context';
import { Key, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  const { isPremiumUser, setPremiumUser } = useAccess();
  
  // Initialize sign-up state from query params
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setShowSignUp(true);
    }
  }, [searchParams]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get("returnTo") || "/";
      // Small delay to ensure any toast messages are seen
      const timer = setTimeout(() => {
        navigate(returnTo);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate, searchParams]);
  
  const formSchema = z.object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const continueAsGuest = async () => {
    await signOut();
    navigate("/");
    toast.success("Continuing as guest. You have 3 free searches.");
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      if (showSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        
        if (signUpError) {
          console.error("Sign-up error:", signUpError.message);
          toast({
            variant: "destructive",
            title: "Sign-up failed",
            description: signUpError.message,
          });
        } else {
          console.log("Sign-up successful:", signUpData);
          
          if (isPremiumUser) {
            toast({
              title: "🎉 Welcome to the premium Diagramr experience!",
              description: "Your account has been created with exclusive access.",
            });
          } else {
            toast({
              title: "Check your email",
              description: "We've sent you a link to verify your email address.",
            });
          }
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (signInError) {
          console.error("Sign-in error:", signInError.message);
          toast({
            variant: "destructive",
            title: "Sign-in failed",
            description: signInError.message,
          });
        } else {
          console.log("Sign-in successful:", signInData);
          
          if (isPremiumUser) {
            toast.success("Welcome back to your premium Diagramr experience!");
          } else {
            toast.success("Successfully signed in!");
          }
          
          const returnTo = searchParams.get("returnTo") || "/";
          navigate(returnTo);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`flex flex-col min-h-screen ${isPremiumUser ? "bg-gradient-to-b from-background to-background/95" : "bg-background"}`}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className={`flex justify-center mb-4 ${isPremiumUser ? "relative" : ""}`}>
              <DiagramrLogo size="md" />
              {isPremiumUser && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute -top-2 -right-2"
                >
                  <Crown className="h-6 w-6 text-amber-400" />
                </motion.div>
              )}
            </div>
            <h1 className={`text-2xl font-bold ${isPremiumUser ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400" : ""}`}>
              {showSignUp ? "Create an Account" : "Sign In to Diagramr"}
              {isPremiumUser && <Sparkles className="ml-2 inline-block h-5 w-5 text-amber-400" />}
            </h1>
            <p className="text-muted-foreground mt-2">
              {showSignUp 
                ? "Create an account to save your favorite diagrams" 
                : "Sign in to access your saved diagrams and preferences"}
            </p>
            {isPremiumUser && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-sm font-medium text-purple-400"
              >
                You have exclusive beta access
              </motion.div>
            )}
          </div>
          
          <Card className={`border ${isPremiumUser ? "border-purple-800/20 bg-card/80 backdrop-blur-sm" : ""}`}>
            <CardHeader className="space-y-1">
              <CardTitle>{showSignUp ? "Create an account" : "Sign in"}</CardTitle>
              <CardDescription>
                {showSignUp
                  ? "Enter your email and password to create an account"
                  : "Enter your email and password to sign in"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="mail@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className={`w-full ${isPremiumUser ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600" : ""}`} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      showSignUp ? (
                        <>
                          Create Account
                          {isPremiumUser && <Sparkles className="ml-2 h-4 w-4" />}
                        </>
                      ) : (
                        "Sign In"
                      )
                    )}
                  </Button>
                </form>
              </Form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <OAuthSignIn isPremium={isPremiumUser} />
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="link" onClick={() => setShowSignUp(!showSignUp)}>
                {showSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </Button>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="ghost" size="sm" onClick={continueAsGuest}>
                  Continue as guest
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
