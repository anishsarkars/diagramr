
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInputProps {
  className?: string;
  onSubmit?: (prompt: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export function AIInput({ className, onSubmit, placeholder, isSearching }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (onSubmit && prompt.trim()) {
      onSubmit(prompt);
      // Don't clear the prompt immediately so users can see what they searched for
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    // Auto focus the input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className={cn("relative transition-all duration-300", className)}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex items-center w-full rounded-xl overflow-hidden",
            "border border-border",
            "bg-background/80 backdrop-blur-sm shadow-sm",
            isFocused ? "ring-2 ring-primary/20 shadow-md" : "",
            isSearching ? "opacity-80" : ""
          )}
        >
          <div className="flex-1 flex items-center relative">
            <div className="absolute left-3 text-muted-foreground">
              <SearchIcon className="h-5 w-5" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || "Describe the diagram you need..."}
              className="pl-11 py-7 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isSearching}
            />
          </div>
          <Button
            size="sm"
            className={cn(
              "mr-2 gap-1.5 rounded-lg transition-all",
              prompt.trim() ? "opacity-100" : "opacity-70"
            )}
            onClick={handleSubmit}
            disabled={!prompt.trim() || isSearching}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Search</span>
          </Button>
        </motion.div>
      </AnimatePresence>
      
      {isSearching && (
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
