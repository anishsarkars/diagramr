
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleSearchBarProps {
  defaultQuery?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  rounded?: boolean;
}

export function SimpleSearchBar({
  defaultQuery = "",
  onSearch,
  isLoading = false,
  placeholder = "Search for diagrams...",
  className = "",
  rounded = true
}: SimpleSearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative w-full max-w-md flex items-center", 
        className
      )}
    >
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-14 py-2.5 border-border/70 focus:border-primary",
            rounded ? "rounded-full" : "rounded-md"
          )}
          disabled={isLoading}
        />
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
          aria-hidden="true"
        />
      </div>
      
      <Button
        type="submit"
        disabled={!query.trim() || isLoading}
        size="icon"
        className={cn(
          "absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8",
          rounded ? "rounded-full" : "rounded-md"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
