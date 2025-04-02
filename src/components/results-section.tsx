
import { useState, useEffect } from "react";
import { DiagramCard } from "@/components/diagram-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DiagramResult } from "@/hooks/use-infinite-search";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Grid3X3, List, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm: string;
  onNewSearch: () => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  lastAction?: "search" | "like";
  selectedTagFilter?: string | null;
  onSelectTagFilter?: (tag: string | null) => void;
  onLike?: (imageId: string | number) => void;
  likedDiagrams?: Set<string>;
  lastResultRef?: (node: HTMLDivElement | null) => void;
  hasMore?: boolean;
  loadMore?: () => void;
}

export function ResultsSection({
  results,
  searchTerm,
  onNewSearch,
  onSearch,
  isLoading,
  lastAction = "search",
  selectedTagFilter,
  onSelectTagFilter,
  onLike,
  likedDiagrams = new Set(),
  lastResultRef,
  hasMore = false,
  loadMore,
}: ResultsSectionProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isMobile = useIsMobile();
  
  // Extract unique tags from results
  useEffect(() => {
    const allTags = results
      .flatMap((result) => result.tags || [])
      .filter(Boolean);
    
    const uniqueTags = Array.from(new Set(allTags))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 12); // Limit to 12 tags
    
    setTags(uniqueTags);
  }, [results]);
  
  const filteredResults = selectedTagFilter
    ? results.filter(
        (result) => result.tags && result.tags.includes(selectedTagFilter)
      )
    : results;

  const handleLoadMore = () => {
    if (isLoading || isLoadingMore || !loadMore) return;
    
    setIsLoadingMore(true);
    try {
      loadMore();
    } finally {
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  };

  const renderResultsCount = () => {
    if (isLoading) return "Searching...";
    
    const count = filteredResults.length;
    let resultsText = `${count} `;
    
    if (lastAction === "search") {
      resultsText += `result${count !== 1 ? "s" : ""} for "${searchTerm}"`;
    } else if (lastAction === "like") {
      resultsText += `liked diagram${count !== 1 ? "s" : ""}`;
    }
    
    if (selectedTagFilter) {
      resultsText += ` • Filtered by: ${selectedTagFilter}`;
    }
    
    return resultsText;
  };

  return (
    <motion.div
      className="container py-6 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search bar and controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 sticky top-16 pt-4 pb-4 bg-background/80 backdrop-blur-md z-30">
        <div className="w-full">
          {onSearch ? (
            <SimpleSearchBar 
              onSearch={onSearch} 
              defaultQuery={searchTerm} 
              className="w-full max-w-none"
            />
          ) : (
            <div className="flex items-center">
              <div className="text-lg font-medium flex items-center">
                {lastAction === "search" ? (
                  <Search className="mr-2 h-5 w-5 text-primary" />
                ) : (
                  <Search className="mr-2 h-5 w-5 text-primary" />
                )}
                <span className="truncate max-w-[300px]">{searchTerm}</span>
              </div>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNewSearch}
                  className="text-sm ml-4"
                >
                  New Search
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tags filter row */}
      {tags.length > 0 && (
        <ScrollArea 
          className="mb-5 w-full whitespace-nowrap pb-2"
        >
          <div className="flex gap-2">
            <Button
              variant={selectedTagFilter ? "outline" : "default"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => onSelectTagFilter && onSelectTagFilter(null)}
            >
              All Results
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTagFilter === tag ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => onSelectTagFilter && onSelectTagFilter(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Results counter */}
      <div className="text-sm text-muted-foreground mb-6">{renderResultsCount()}</div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center pt-12 pb-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary/70 mb-4" />
          <p className="text-lg text-muted-foreground">Searching for diagrams...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-muted/30 rounded-full p-4 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            We couldn't find any diagrams for "{searchTerm}". Try a different search term or browse popular searches.
          </p>
          <Button onClick={onNewSearch}>New Search</Button>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            <div
              className={cn({
                "grid gap-4 sm:gap-6": true,
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4": viewMode === "grid",
                "grid-cols-1": viewMode === "list",
              })}
            >
              {filteredResults.map((result, index) => {
                const isLastItem = index === filteredResults.length - 1;
                
                return (
                  <motion.div
                    key={`${result.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index % 12 * 0.05 }}
                    className={cn({
                      "col-span-1": true,
                      "h-full": viewMode === "grid",
                    })}
                    ref={isLastItem ? lastResultRef : null}
                  >
                    <DiagramCard
                      id={result.id}
                      title={result.title}
                      imageSrc={result.imageSrc}
                      author={result.author}
                      authorUsername={result.authorUsername}
                      tags={result.tags}
                      sourceUrl={result.sourceUrl}
                      isLiked={result.id ? likedDiagrams.has(String(result.id)) : false}
                      onLike={() => onLike && onLike(result.id)}
                      mode={viewMode}
                      onTagClick={(tag) => onSelectTagFilter && onSelectTagFilter(tag)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLoadMore} 
                disabled={isLoadingMore}
                className="min-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More Results
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
