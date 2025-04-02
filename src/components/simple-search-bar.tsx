
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedSearchBar } from "./enhanced-search-bar";

interface SimpleSearchBarProps {
  className?: string;
  onSearch: (query: string) => void;
  defaultQuery?: string;
  placeholder?: string;
  isLoading?: boolean;
}

export function SimpleSearchBar({
  className,
  onSearch,
  defaultQuery = "",
  placeholder,
  isLoading,
}: SimpleSearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <EnhancedSearchBar
        onSearch={onSearch}
        defaultValue={query}
        placeholder={placeholder || "Search for diagrams..."}
        isLoading={isLoading}
      />
    </div>
  );
}
