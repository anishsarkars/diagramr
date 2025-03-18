
import { DiagramResult } from "@/hooks/use-infinite-search";
import { Button } from "@/components/ui/button";
import { DiagramCard } from "@/components/diagram-card";
import { Badge } from "@/components/ui/badge";
import { 
  SearchIcon, 
  Loader2Icon, 
  ArchiveIcon, 
  FilterIcon,
  Wand2Icon, 
  AlertCircleIcon
} from "lucide-react";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedContainer } from "@/components/animated-container";
import { useInView } from "react-intersection-observer";

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction: "search" | "generate";
  onLike?: (id: string | number) => void;
  likedDiagrams?: Set<string>;
  lastResultRef?: (node: HTMLDivElement) => void;
  hasMore: boolean; // Added hasMore property to the interface
}

export function ResultsSection({ 
  results, 
  searchTerm, 
  onNewSearch, 
  isLoading,
  lastAction,
  onLike,
  likedDiagrams = new Set(),
  lastResultRef,
  hasMore // Added hasMore to the destructured props
}: ResultsSectionProps) {
  const [sortOption, setSortOption] = useState<"relevance" | "newest">("relevance");
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true });

  const isLiked = (id: string | number) => likedDiagrams.has(String(id));

  const handleLike = (id: string | number) => {
    if (onLike) {
      onLike(id);
    }
  };

  return (
    <div className="container py-8 pb-16">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {lastAction === "search" ? "Search Results" : "AI Generated"}
            </Badge>
            {lastAction === "generate" && (
              <Badge variant="outline" className="bg-secondary/40">Beta</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{searchTerm}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLoading ? (
              "Finding the best diagrams..."
            ) : results.length > 0 ? (
              `Found ${results.length} diagram${results.length > 1 ? "s" : ""}`
            ) : (
              "No diagrams found. Try a different search term."
            )}
          </p>
        </motion.div>

        <div className="flex items-center gap-2">
          <SimpleSearchBar onSearch={onNewSearch} />
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={lastAction === "search" ? "default" : "outline"} 
            className="px-3 py-1 cursor-pointer"
          >
            <SearchIcon className="h-3 w-3 mr-1" />
            Search
          </Badge>
          <Badge 
            variant={lastAction === "generate" ? "default" : "outline"} 
            className="px-3 py-1 cursor-pointer"
          >
            <Wand2Icon className="h-3 w-3 mr-1" />
            Generated
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FilterIcon className="h-4 w-4" />
            <span>Sort by:</span>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as "relevance" | "newest")}
              className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          
          <Button variant="outline" size="sm" onClick={onNewSearch}>
            New Search
          </Button>
        </div>
      </div>

      {/* Results grid with animation */}
      <AnimatePresence>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AnimatedContainer className="flex flex-col items-center justify-center">
              {lastAction === "search" ? (
                <SearchIcon className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
              ) : (
                <Wand2Icon className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
              )}
              <h3 className="text-xl font-medium mb-2">
                {lastAction === "search" ? "Searching for diagrams..." : "Generating your diagram..."}
              </h3>
              <p className="text-muted-foreground max-w-md text-center">
                {lastAction === "search" 
                  ? "We're finding the most relevant diagrams for your search." 
                  : "Our AI is crafting a custom diagram based on your description."}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">This may take a moment</span>
              </div>
            </AnimatedContainer>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <AnimatedContainer className="flex flex-col items-center">
              <AlertCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No diagrams found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any diagrams matching your search. Try using different keywords or generate a custom diagram.
              </p>
              <Button onClick={onNewSearch} className="mt-6">Try a different search</Button>
            </AnimatedContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((result, index) => {
              // Check if this is the last item to attach the ref for infinite scrolling
              if (results.length === index + 1) {
                return (
                  <div ref={lastResultRef} key={result.id}>
                    <DiagramCard
                      title={result.title}
                      imageSrc={result.imageSrc}
                      author={result.author}
                      authorUsername={result.authorUsername}
                      sourceUrl={result.sourceUrl}
                      tags={result.tags}
                      isGenerated={result.isGenerated}
                      isLiked={isLiked(result.id)}
                      onLike={() => handleLike(result.id)}
                    />
                  </div>
                );
              } else {
                return (
                  <DiagramCard
                    key={result.id}
                    title={result.title}
                    imageSrc={result.imageSrc}
                    author={result.author}
                    authorUsername={result.authorUsername}
                    sourceUrl={result.sourceUrl}
                    tags={result.tags}
                    isGenerated={result.isGenerated}
                    isLiked={isLiked(result.id)}
                    onLike={() => handleLike(result.id)}
                  />
                );
              }
            })}
          </div>
        )}
      </AnimatePresence>
      
      {/* Loading more results indicator */}
      {!isLoading && results.length > 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading more results...</span>
          </div>
        </div>
      )}
      
      {!isLoading && results.length > 0 && !hasMore && (
        <div className="text-center mt-8 py-4">
          <p className="text-muted-foreground text-sm">You've reached the end of the results</p>
          <Button variant="outline" onClick={onNewSearch} className="mt-4">
            New Search
          </Button>
        </div>
      )}
    </div>
  );
}
