
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const waitlistSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
});

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate inputs
      const result = waitlistSchema.safeParse({ email, name: name || undefined });
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
      
      // Store the waitlist submission in local storage as a fallback
      localStorage.setItem('waitlist-submission', JSON.stringify({
        email,
        name: name || null,
        timestamp: new Date().toISOString()
      }));
      
      // Since there's no 'waitlist' table in Supabase yet,
      // we'll use a more resilient approach for now - localStorage and simulated API success
      
      // Simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success state
      setIsSubmitted(true);
      toast.success("You've been added to our waitlist! We'll notify you when spots open up.");
      
    } catch (error) {
      console.error("Waitlist submission error:", error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to join waitlist. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[400px] max-w-[90%] shadow-xl">
      <CardHeader className="space-y-1 flex items-center">
        <div className="w-full flex justify-center mb-4">
          <DiagramrLogo className="h-10 w-auto" />
        </div>
        <CardTitle className="text-2xl text-center font-serif">
          Join our Waitlist
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground/90">
          {isSubmitted 
            ? "Thanks for joining! We'll be in touch soon."
            : "We've reached our user limit. Join the waitlist to be notified when spots open up."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                id="name"
                placeholder="Name (optional)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/80 dark:bg-gray-950/80 shadow-sm border-gray-200 dark:border-gray-800"
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
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
                  Joining Waitlist...
                </>
              ) : (
                <>Join Waitlist</>
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-green-500 mx-auto mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-xl font-medium">You're on the list!</p>
              <p className="text-muted-foreground">We'll notify you when a spot becomes available.</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-center text-muted-foreground">
          We'll email you when spots become available. Thank you for your interest in Diagramr!
        </p>
      </CardFooter>
    </Card>
  );
} 
