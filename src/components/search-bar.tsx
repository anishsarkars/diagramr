import { cn } from "@/lib/utils";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, ArrowLeft, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar } from "@/components/ui/avatar";

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

interface RecentItem {
  id: string;
  name: string;
  image: string;
}

interface SearchSuggestion {
  text: string;
  type: 'history' | 'suggestion';
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isMobile = useIsMobile();

  // Mock recent items - in a real app, this would come from your data store
  const recentItems: RecentItem[] = [
    { id: '1', name: 'John A.', image: '/avatars/john.jpg' },
    { id: '2', name: 'Mark B.', image: '/avatars/mark.jpg' },
    { id: '3', name: 'Sud For.', image: '/avatars/sud.jpg' },
    { id: '4', name: 'Kelly M.', image: '/avatars/kelly.jpg' },
    { id: '5', name: 'Americ...', image: '/avatars/america.jpg' },
    { id: '6', name: 'Nata...', image: '/avatars/nata.jpg' },
  ];

  // Mock search suggestions
  const searchSuggestions: SearchSuggestion[] = [
    { text: 'Highway ki chadar', type: 'history' },
    { text: 'Highway', type: 'suggestion' },
    { text: 'Highway to hell', type: 'suggestion' },
    { text: 'Highway full movie', type: 'suggestion' },
    { text: 'Highway alia dance english song', type: 'suggestion' },
    { text: 'Highway Songs', type: 'suggestion' },
  ];

  // Mock tags
  const tags = ['songs', 'alia bhatt', 'movie', 'to hell'];

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
    // Return empty div to hide search completely on mobile
    return null;
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
        <Search className="h-4 w-4" />
        <span>Search</span>
      </Button>
    </div>
  );
}
