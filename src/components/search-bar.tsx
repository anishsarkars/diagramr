
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

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

  return (
    <div className={cn("flex w-full max-w-2xl items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search for diagrams, charts, or topics..."
          className="pl-9 pr-4 py-6 text-base w-full border-border bg-background"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <Button size="sm" className="h-12 px-6 gap-2" onClick={handleSearch}>
        <Sparkles className="h-4 w-4" />
        <span>AI Search</span>
      </Button>
    </div>
  );
}
