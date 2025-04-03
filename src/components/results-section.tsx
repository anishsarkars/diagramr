
import { useState, useEffect } from "react";
import { DiagramCard } from "@/components/diagram-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DiagramResult } from "@/hooks/use-infinite-search";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Grid3X3, List, ChevronDown, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

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
  const [currentBatch, setCurrentBatch] = useState<DiagramResult[]>([]);
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
    
    // Show in batches for better UI
    if (results.length > 0) {
      setCurrentBatch(results);
    }
  }, [results]);
  
  const filteredResults = selectedTagFilter
    ? currentBatch.filter(
        (result) => result.tags && result.tags.includes(selectedTagFilter)
      )
    : currentBatch;

  const handleLoadMore = async () => {
    if (isLoading || isLoadingMore || !loadMore) return;
    
    setIsLoadingMore(true);
    try {
      await loadMore();
      toast.success("More diagrams loaded");
    } catch (error) {
      console.error("Error loading more results:", error);
      toast.error("Failed to load more results");
    } finally {
      setTimeout(() => setIsLoadingMore(false), 500);
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

  const getLayoutGridClasses = () => {
    // Enhanced bento-style grid
    return {
      "grid gap-5": true,
      "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3": viewMode === "grid",
      "grid-cols-1": viewMode === "list",
    };
  };

  return (
    <motion.div
      className="container py-4 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search bar and controls */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4 sticky top-16 pt-3 pb-3 bg-background/90 backdrop-blur-sm z-30">
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
          className="mb-4 w-full whitespace-nowrap pb-2"
        >
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={selectedTagFilter ? "outline" : "default"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => onSelectTagFilter && onSelectTagFilter(null)}
              >
                All Results
              </Button>
            </motion.div>
            {tags.map((tag) => (
              <motion.div key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={selectedTagFilter === tag ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => onSelectTagFilter && onSelectTagFilter(tag)}
                >
                  {tag}
                </Button>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Results counter */}
      <div className="text-sm text-muted-foreground mb-4">{renderResultsCount()}</div>

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
        <div className="space-y-6">
          <AnimatePresence>
            <div className={cn(getLayoutGridClasses())}>
              {filteredResults.map((result, index) => {
                const isLastItem = index === filteredResults.length - 1;
                const isPromoted = index === 0 || index === 3;
                
                return (
                  <motion.div
                    key={`${result.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: Math.min(index % 8 * 0.05, 0.4),
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className={cn({
                      "col-span-1": !isPromoted || viewMode === "list",
                      "row-span-1": !isPromoted || viewMode === "list",
                      "md:col-span-2 md:row-span-1": isPromoted && viewMode === "grid" && index === 0,
                      "h-full": viewMode === "grid",
                      "shadow-sm hover:shadow-md transition-all duration-300": true,
                      "border border-border/30 rounded-xl overflow-hidden": true,
                    })}
                    ref={isLastItem ? lastResultRef : null}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
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
                      isPriority={isPromoted}
                    />
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
              </motion.div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
