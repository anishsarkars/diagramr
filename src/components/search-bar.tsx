import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, SendHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isMobile) {
    return (
      <div className="mobile-search-container">
        <div className="mobile-search-wrapper">
          <div className="mobile-search-input-container">
            <Input
              type="text"
              placeholder="What do you want to know?"
              className={cn(
                "mobile-search-input",
                isFocused && "ring-1 ring-white/20"
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Search className="mobile-search-icon" />
          </div>
          <Button 
            size="icon"
            className="mobile-search-button"
            onClick={handleSearch}
            variant="ghost"
            disabled={!query.trim()}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full max-w-2xl items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search for diagrams..."
          className="pl-9 pr-4 py-6 text-base w-full border-border bg-background"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <Button 
        size="sm" 
        className="h-12 px-6 gap-2" 
        onClick={handleSearch}
        disabled={!query.trim()}
      >
        <SendHorizontal className="h-4 w-4" />
        <span>Search</span>
      </Button>
    </div>
  );
}
