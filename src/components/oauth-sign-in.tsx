import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { motion } from "framer-motion";

interface OAuthSignInProps {
  isPremium?: boolean;
  className?: string;
  onGoogleLogin: () => Promise<void>;
  onLinkedInLogin?: () => Promise<void>;
  isLoading?: boolean;
}

export function OAuthSignIn({ 
  isPremium = false, 
  className = "", 
  onGoogleLogin, 
  onLinkedInLogin, 
  isLoading = false 
}: OAuthSignInProps) {
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          type="button" 
          disabled={true}
          className={`w-full transition-all duration-300 flex items-center justify-center ${
            isPremium 
              ? "border-primary/20 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm" 
              : "hover:border-primary/30 hover:shadow-sm"
          }`}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
          <span className="ml-2 text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
        </Button>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          type="button" 
          disabled={true}
          className="w-full transition-all duration-300 flex items-center justify-center hover:border-primary/30 hover:shadow-sm"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="mr-2 h-4 w-4 fill-current text-[#0A66C2]"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
          </svg>
          Continue with LinkedIn
          <span className="ml-2 text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
        </Button>
      </motion.div>
    </div>
  );
}
