
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

interface OAuthSignInProps {
  isPremium?: boolean;
}

export function OAuthSignIn({ isPremium = false }: OAuthSignInProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
    } catch (error) {
      console.error("OAuth sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading} 
        onClick={handleGoogleSignIn}
        className={`w-full ${isPremium ? "border-purple-500/20 hover:border-purple-500/30 hover:bg-purple-500/10" : ""}`}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}
