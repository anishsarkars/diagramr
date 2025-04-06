import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-context";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const { success, error } = await forgotPassword(values.email);
      
      if (success) {
        setIsSubmitted(true);
        toast.success("Recovery email sent", {
          description: "Please check your email for instructions to reset your password",
        });
      } else {
        toast.error("Failed to send recovery email", {
          description: error || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error in password recovery:", error);
      toast.error("Something went wrong", {
        description: "We couldn't process your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 w-full max-w-md mx-auto">
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Password Recovery</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Check your email for password reset instructions"
              : "Enter your email to receive password reset instructions"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  We've sent instructions to reset your password to the email address you provided.
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          disabled={isLoading}
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Recovery Email"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-border/20 pt-4">
          <Button variant="link" size="sm" asChild>
            <Link to="/auth" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 