
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface OAuthSignInProps {
  isPremium?: boolean;
  className?: string;
}

export function OAuthSignIn({ isPremium = false, className = "" }: OAuthSignInProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            client_id: '680718326327-duph7gibjc8kdejfsv6h7qafo1lcc478.apps.googleusercontent.com',
            access_type: 'offline',
            prompt: 'consent',
          },
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
    <div className={`flex flex-col space-y-2 ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading} 
          onClick={handleGoogleSignIn}
          className={`w-full transition-all duration-300 ${isPremium 
            ? "border-purple-500/20 hover:border-purple-500/30 hover:bg-purple-500/10 hover:shadow-sm" 
            : "hover:shadow-sm"}`}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Sign in with Google
        </Button>
      </motion.div>
    </div>
  );
}
