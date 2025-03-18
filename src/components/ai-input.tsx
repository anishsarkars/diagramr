
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, Sparkles, Wand2, LightbulbIcon, SendIcon, CornerRightDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInputProps {
  className?: string;
  onSubmit?: (prompt: string, mode: "search" | "generate") => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function AIInput({ className, onSubmit, placeholder, isLoading }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<"search" | "generate">("search");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (onSubmit && prompt.trim()) {
      onSubmit(prompt, mode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <motion.div 
      className={cn("relative transition-all duration-300 w-full max-w-3xl", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence>
        <motion.div
          className={cn(
            "flex items-center w-full rounded-2xl overflow-hidden",
            "border border-border/30",
            "bg-background/80 backdrop-blur-lg shadow-md",
            isFocused ? "ring-2 ring-primary/20 shadow-xl border-primary/30" : "",
            isLoading ? "opacity-80" : ""
          )}
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex-1 flex items-center relative">
            <div className="absolute left-4 text-muted-foreground/80">
              {mode === "search" ? (
                <SearchIcon className="h-5 w-5" />
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || (mode === "search" 
                ? "Search for diagrams (e.g., 'network architecture')..." 
                : "Describe the diagram you want to generate...")}
              className="pl-12 py-8 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 mr-3">
            <Button
              size="sm"
              variant={mode === "search" ? "default" : "outline"}
              className={cn(
                "rounded-xl transition-all px-4 py-2.5",
                mode === "search" ? "bg-primary/90 hover:bg-primary" : "bg-background/60 hover:bg-background"
              )}
              onClick={() => setMode("search")}
              disabled={isLoading}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              <span>Search</span>
            </Button>
            <Button
              size="sm"
              variant={mode === "generate" ? "default" : "outline"}
              className={cn(
                "rounded-xl transition-all px-4 py-2.5",
                mode === "generate" ? "bg-primary/90 hover:bg-primary" : "bg-background/60 hover:bg-background"
              )}
              onClick={() => setMode("generate")}
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Generate</span>
            </Button>
            
            <AnimatePresence>
              {prompt.trim() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    size="sm"
                    className="rounded-xl px-4 py-2.5 bg-primary/90 hover:bg-primary"
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isLoading}
                  >
                    {isLoading ? (
                      <motion.div 
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <CornerRightDown className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {isLoading && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
