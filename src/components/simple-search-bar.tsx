import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface SimpleSearchBarProps extends Omit<HTMLMotionProps<"form">, "onSubmit"> {
  onSearch: (query: string) => void;
  defaultQuery?: string;
  className?: string;
  placeholder?: string;
  showButton?: boolean;
  mobileMode?: boolean;
  rounded?: boolean;
  height?: 'default' | 'large';
}

export function SimpleSearchBar({
  onSearch,
  defaultQuery = "",
  className = "",
  placeholder = "Search diagrams...",
  showButton = true,
  mobileMode = false,
  rounded = false,
  height = 'default',
  ...props
}: SimpleSearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query?.trim()) {
      onSearch(query.trim());
    }
  };

  const getInputClasses = () => {
    const baseClasses = cn(
      "md:text-sm",
      "pr-12",
      mobileMode ? "pl-4" : "pl-10",
      height === 'large' ? "h-14 text-base" : "h-10 text-sm",
      rounded ? "rounded-full" : "rounded-md",
      "bg-muted/30 border-0",
      {
        "ring-2 ring-primary/20": isInputFocused || isTyping,
      }
    );
    return baseClasses;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      inputRef.current?.blur();
    } else if (event.key === "Enter") {
      if (query?.trim()) {
        onSearch(query.trim());
      }
    }
  };

  // Manage typing state
  useEffect(() => {
    // Consider user typing when query changes
    if (query !== defaultQuery) {
      setIsTyping(true);
      
      // Clear any existing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Set timer to stop typing state after 2 seconds of inactivity
      typingTimerRef.current = setTimeout(() => {
        if (!isInputFocused) { // Only reset if not focused
          setIsTyping(false);
        }
      }, 2000);
    }
    
    // Auto focus while typing
    if (query && query.trim().length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [query, isInputFocused, defaultQuery]);

  // Determine if search bar should be in raised position
  const shouldBeRaised = mobileMode && (isInputFocused || isTyping || query?.trim().length > 0);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className={cn("relative flex items-center w-full", className)}
      animate={shouldBeRaised ? {
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      } : { y: 0 }}
      {...props}
    >
      <div 
        className={cn(
          "absolute",
          mobileMode ? "right-4" : "left-3",
          "top-1/2 transform -translate-y-1/2 text-muted-foreground z-10",
          mobileMode && "bg-emerald-500 rounded-full p-1.5"
        )}
      >
        <Search className={cn("h-4 w-4", mobileMode && "text-white")} />
      </div>

      {mobileMode && (
        <motion.div 
          className="absolute -inset-3 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 rounded-full blur-xl opacity-0"
          animate={shouldBeRaised ? { opacity: 0.8 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      <Input
        ref={inputRef}
        type="text"
        value={query || ''}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsTyping(true);
        }}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => {
          // Small delay to maintain animation during quick taps
          setTimeout(() => {
            setIsInputFocused(false);
            // Don't reset isTyping here, let the timer handle it
          }, 100);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={getInputClasses()}
      />
      
      {showButton && !mobileMode && (
        <Button 
          type="submit" 
          size="sm" 
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2",
            "h-8 px-3",
            rounded ? "rounded-full" : "rounded-md"
          )}
          disabled={!query?.trim()}
        >
          Search
        </Button>
      )}
    </motion.form>
  );
}
