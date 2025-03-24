
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Icons } from "@/components/icons";

interface OAuthSignInProps {
  isPremium?: boolean;
}

export function OAuthSignIn({ isPremium = false }: OAuthSignInProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
    } catch (error) {
      console.error("OAuth sign-in error:", error);
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
        onClick={handleGithubSignIn}
        className={`w-full ${isPremium ? "border-purple-500/20 hover:border-purple-500/30 hover:bg-purple-500/10" : ""}`}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4" />
        ) : (
          <Github className="mr-2 h-4 w-4" />
        )}
        GitHub
      </Button>
    </div>
  );
}
