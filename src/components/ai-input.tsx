
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, Sparkles, Wand2 } from "lucide-react";
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
            isLoading ? "opacity-80" : ""
          )}
        >
          <div className="flex-1 flex items-center relative">
            <div className="absolute left-3 text-muted-foreground">
              {mode === "search" ? (
                <SearchIcon className="h-5 w-5" />
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || (mode === "search" ? "Search for diagrams (e.g., 'network diagram')..." : "Describe the diagram you want to generate...")}
              className="pl-11 py-7 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 mr-2">
            <Button
              size="sm"
              variant={mode === "search" ? "default" : "outline"}
              className="rounded-lg transition-all"
              onClick={() => setMode("search")}
              disabled={isLoading}
            >
              <SearchIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Search</span>
            </Button>
            <Button
              size="sm"
              variant={mode === "generate" ? "default" : "outline"}
              className="rounded-lg transition-all"
              onClick={() => setMode("generate")}
              disabled={isLoading}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span>Generate</span>
            </Button>
          </div>
          
          <Button
            size="sm"
            className={cn(
              "mr-2 gap-1.5 rounded-lg transition-all",
              prompt.trim() ? "opacity-100" : "opacity-70"
            )}
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            <span>Go</span>
          </Button>
        </motion.div>
      </AnimatePresence>
      
      {isLoading && (
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
