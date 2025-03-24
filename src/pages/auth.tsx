import { useState } from "react";
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
  FormDescription,
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
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAccess } from '@/components/access-context';
import { Key } from "lucide-react";
import confetti from 'canvas-confetti';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const { accessStatus, validateAccessCode, hasValidAccessCode } = useAccess();
  const [accessCode, setAccessCode] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [showAccessCodeSection, setShowAccessCodeSection] = useState(!hasValidAccessCode);
  
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
  };
  
  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error("Please enter your access code");
      return;
    }
    
    setIsValidatingCode(true);
    
    try {
      const isValid = await validateAccessCode(accessCode);
      
      if (isValid) {
        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast.success("Access granted! You can now create an account.");
        setShowAccessCodeSection(false);
      } else {
        toast.error("Invalid access code. Please try again or request access.");
      }
    } catch (error) {
      console.error("Error validating access code:", error);
      toast.error("Failed to validate access code. Please try again.");
    } finally {
      setIsValidatingCode(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      if (showSignUp) {
        // Sign up
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
          toast({
            title: "Check your email",
            description: "We've sent you a link to verify your email address.",
          });
        }
      } else {
        // Sign in
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
          
          // Redirect to the original page or the home page
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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <DiagramrLogo size="md" />
            </div>
            <h1 className="text-2xl font-bold">{showSignUp ? "Create an Account" : "Sign In to Diagramr"}</h1>
            <p className="text-muted-foreground mt-2">
              {showSignUp 
                ? "Create an account to save your favorite diagrams" 
                : "Sign in to access your saved diagrams and preferences"}
            </p>
          </div>
          
          {/* Access Code Section */}
          {showAccessCodeSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-muted/40 p-6 rounded-lg border shadow-sm"
            >
              <form onSubmit={handleAccessCodeSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <Label htmlFor="access-code">Beta Access Code</Label>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Diagramr is currently in private beta (due to API limitations). Enter your access code to continue.
                    </div>
                    <Input
                      id="access-code"
                      placeholder="Enter your access code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="tracking-wider text-center"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Need an access code? Contact <a href="https://wa.link/g46cv1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Anish</a> to request access.
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isValidatingCode}>
                    {isValidatingCode ? "Validating..." : "Verify Access Code"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Regular Auth Form */}
          {(!showAccessCodeSection || hasValidAccessCode) && (
            <Card className="border">
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        showSignUp ? "Create Account" : "Sign In"
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
                <OAuthSignIn />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" onClick={() => setShowSignUp(!showSignUp)}>
                  {showSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
