
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
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    google: false,
    linkedin: false
  });

  const handleGoogleSignIn = async () => {
    setIsLoading({ ...isLoading, google: true });
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
      setIsLoading({ ...isLoading, google: false });
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading({ ...isLoading, linkedin: true });
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
    } catch (error) {
      console.error("LinkedIn sign-in error:", error);
      toast.error("Failed to sign in with LinkedIn. Please try again.");
      setIsLoading({ ...isLoading, linkedin: false });
    }
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading.google} 
          onClick={handleGoogleSignIn}
          className={`w-full transition-all duration-300 ${isPremium 
            ? "border-purple-500/20 hover:border-purple-500/30 hover:bg-purple-500/10 hover:shadow-sm" 
            : "hover:shadow-sm"}`}
        >
          {isLoading.google ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Sign in with Google
        </Button>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading.linkedin} 
          onClick={handleLinkedInSignIn}
          className={`w-full transition-all duration-300 ${isPremium 
            ? "border-blue-500/20 hover:border-blue-500/30 hover:bg-blue-500/10 hover:shadow-sm" 
            : "hover:shadow-sm"}`}
        >
          {isLoading.linkedin ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
            </svg>
          )}
          Sign in with LinkedIn
        </Button>
      </motion.div>
    </div>
  );
}
