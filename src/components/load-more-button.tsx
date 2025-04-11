
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader } from "lucide-react";
import { motion } from "framer-motion";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  visible: boolean;
}

export function LoadMoreButton({ onClick, isLoading, visible }: LoadMoreButtonProps) {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-center my-6"
    >
      <Button 
        variant="outline" 
        size="lg" 
        onClick={onClick}
        disabled={isLoading}
        className="gap-2 min-w-[180px] border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <ArrowDown className="h-4 w-4" />
            <span>Load More Results</span>
          </>
        )}
      </Button>
    </motion.div>
  );
}
