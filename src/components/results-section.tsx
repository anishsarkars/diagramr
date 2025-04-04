import { useState, useEffect, useCallback } from "react";
import { DiagramCard } from "@/components/diagram-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DiagramResult } from "@/hooks/use-infinite-search";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Search, 
  Grid3X3, 
  List, 
  ChevronDown, 
  ArrowRight,
  Download,
  Share2
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Number of results to show initially (limit to 15-20 as requested)
const INITIAL_RESULTS_COUNT = 15;
const MOBILE_RESULTS_COUNT = 15;
const RESULTS_PER_LOAD = 12;

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm?: string;
  onNewSearch?: () => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  lastAction?: "search" | "like";
  selectedTagFilter?: string | null;
  onTagFilterSelect?: (tag: string | null) => void;
  onSelectTagFilter?: (tag: string | null) => void;
  onLike?: (imageId: string | number) => void;
  likedDiagrams?: Set<string>;
  lastDiagramRef?: (node: HTMLDivElement | null) => void;
  hasMore?: boolean;
  loadMore?: () => void;
  error?: Error | null;
}

export function ResultsSection({
  results,
  searchTerm = "",
  onNewSearch = () => {},
  onSearch,
  isLoading,
  lastAction = "search",
  selectedTagFilter,
  onTagFilterSelect,
  onSelectTagFilter,
  onLike,
  likedDiagrams = new Set(),
  lastDiagramRef,
  hasMore = false,
  loadMore,
  error
}: ResultsSectionProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<DiagramResult[]>([]);
  const [visibleResults, setVisibleResults] = useState<DiagramResult[]>([]);
  const [sortBy, setSortBy] = useState("popular");
  const [diagramTypeFilter, setDiagramTypeFilter] = useState<string>("all");
  
  // Calculate initial visible count based on device
  const initialVisibleCount = isMobile ? MOBILE_RESULTS_COUNT : INITIAL_RESULTS_COUNT;
  
  // Extract unique tags from results and set up initial batch
  useEffect(() => {
    if (results.length === 0) return;

    const allTags = results
      .flatMap((result) => result.tags || [])
      .filter(Boolean);
    
    const uniqueTags = Array.from(new Set(allTags))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 3); // Limit to 3 tags for cleaner UI
    
    setTags(uniqueTags);
    setCurrentBatch(results);
    
    // Initialize visible results with first batch
    setVisibleResults(results.slice(0, initialVisibleCount));
  }, [results, initialVisibleCount]);
  
  // Filter results based on diagram type and tag
  useEffect(() => {
    let filtered = [...currentBatch]; // Create a copy to avoid mutation issues
    
    // Apply tag filter
    if (selectedTagFilter) {
      filtered = filtered.filter(
        (result) => result.tags && result.tags.includes(selectedTagFilter)
      );
    }
    
    // Apply diagram type filter using tags
    if (diagramTypeFilter !== "all") {
      filtered = filtered.filter(
        (result) => {
          // Handle tags being possibly undefined
          if (!result.tags || result.tags.length === 0) return false;
          
          // For exact matches like "flowchart", "uml", etc.
          const exactMatch = result.tags.some(tag => 
            tag.toLowerCase() === diagramTypeFilter.toLowerCase() ||
            tag.toLowerCase().includes(diagramTypeFilter.toLowerCase())
          );
          
          // For compound terms like "er-diagram", "mind-map"
          const partMatch = result.tags.some(tag => 
            diagramTypeFilter.toLowerCase().includes(tag.toLowerCase())
          );
          
          return exactMatch || partMatch;
        }
      );
    }
    
    // Apply basic deduplication by removing results with identical titles or images
    const seen = new Set();
    filtered = filtered.filter(result => {
      // Create a unique key from title and image source
      const key = `${result.title?.toLowerCase() || ''}-${result.imageSrc?.split('?')[0] || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Apply sorting (default to relevant if filtering)
    if (sortBy === "popular") {
      filtered.sort((a, b) => ((b as any).likes || 0) - ((a as any).likes || 0));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date((b as any).createdAt || Date.now()).getTime() - new Date((a as any).createdAt || Date.now()).getTime());
    } else { // "relevant"
      // Boost results with more complete metadata and prioritize title matches
      filtered.sort((a, b) => {
        // Check if title contains search term for higher relevance
        const aMatchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const bMatchesSearch = b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        
        if (aMatchesSearch && !bMatchesSearch) return -1;
        if (!aMatchesSearch && bMatchesSearch) return 1;
        
        // Then check metadata completeness
        const completenessA = (a.title ? 1 : 0) + (a.author ? 1 : 0) + (a.tags?.length ? 1 : 0);
        const completenessB = (b.title ? 1 : 0) + (b.author ? 1 : 0) + (b.tags?.length ? 1 : 0);
        return completenessB - completenessA;
      });
    }
    
    // Update visible results with proper count
    setVisibleResults(filtered.slice(0, initialVisibleCount));
  }, [currentBatch, selectedTagFilter, diagramTypeFilter, initialVisibleCount, sortBy, searchTerm]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      // Apply filters to ensure consistent results when loading more
      let filteredBatch = [...currentBatch];
      
      // Apply same filters as the useEffect
      if (selectedTagFilter) {
        filteredBatch = filteredBatch.filter(
          (result) => result.tags && result.tags.includes(selectedTagFilter)
        );
      }
      
      if (diagramTypeFilter !== "all") {
        filteredBatch = filteredBatch.filter(result => {
          if (!result.tags || result.tags.length === 0) return false;
          
          const exactMatch = result.tags.some(tag => 
            tag.toLowerCase() === diagramTypeFilter.toLowerCase() ||
            tag.toLowerCase().includes(diagramTypeFilter.toLowerCase())
          );
          
          const partMatch = result.tags.some(tag => 
            diagramTypeFilter.toLowerCase().includes(tag.toLowerCase())
          );
          
          return exactMatch || partMatch;
        });
      }
      
      if (visibleResults.length < filteredBatch.length) {
        // Load more from current filtered batch
        const moreResults = filteredBatch.slice(visibleResults.length, 
          visibleResults.length + RESULTS_PER_LOAD);
        
        setVisibleResults(prev => [...prev, ...moreResults]);
        
        toast.success("More diagrams loaded", { 
          duration: 2000,
          position: "bottom-center",
          style: { backgroundColor: "rgba(0,0,0,0.7)", color: "white" }
        });
      } else if (loadMore) {
        // Load more from API
      await loadMore();
        toast.success("More diagrams loaded", { 
          duration: 2000,
          position: "bottom-center",
          style: { backgroundColor: "rgba(0,0,0,0.7)", color: "white" }
        });
      }
    } catch (error) {
      console.error("Error loading more results:", error);
      toast.error("Failed to load more results");
    } finally {
      setTimeout(() => setIsLoadingMore(false), 500);
    }
  }, [isLoading, isLoadingMore, loadMore, visibleResults.length, currentBatch, 
      selectedTagFilter, diagramTypeFilter]);

  const handleDownload = (id: string | number, format: string) => {
    // Start loading indicator
    toast.loading(`Preparing ${format.toUpperCase()} download...`, {
      id: `download-${id}`,
      duration: 2000
    });
    
    // In a real implementation, you would fetch the diagram
    // For demo, simulate download with timeout
    setTimeout(() => {
      // Create a dummy download link
      const link = document.createElement('a');
      link.href = '#'; // In real app: actual URL to download the file
      link.download = `diagram-${id}.${format.toLowerCase()}`;
      
      // Success notification
      toast.success(`Downloaded diagram as ${format.toUpperCase()}`, {
        id: `download-${id}`,
        duration: 3000,
        position: "bottom-center"
      });
      
      // Simulate click to trigger download
      // In a real app, you might use the actual link and trigger download
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    }, 1500);
  };

  const handleShare = (id: string | number) => {
    // Generate shareable link
    const shareableLink = `${window.location.origin}/diagrams/${id}`;
    
    // Check if native share is available (mobile devices)
    if (navigator.share) {
      navigator.share({
        title: 'Check out this diagram',
        text: 'I found this interesting diagram that might help you',
        url: shareableLink,
      })
      .then(() => {
        toast.success("Shared successfully", {
          duration: 2000,
          position: "bottom-center",
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        // Fall back to clipboard
        copyToClipboard(shareableLink);
      });
    } else {
      // Use clipboard if share API not available
      copyToClipboard(shareableLink);
    }
  };
  
  // Helper function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard", {
          duration: 2000,
          position: "bottom-center",
        });
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  const renderResultsCount = () => {
    if (isLoading) return "Searching...";
    
    const count = visibleResults.length;
    const totalCount = 
      diagramTypeFilter !== "all" || selectedTagFilter 
        ? visibleResults.length
        : Math.min(currentBatch.length, 20); // Limit displayed total to 20 as per requirement
        
    let resultsText = `${count} `;
    
    if (lastAction === "search") {
      resultsText += `result${count !== 1 ? "s" : ""} for "${searchTerm}"`;
      if (currentBatch.length > 20) {
        resultsText += ` (showing limited set)`;
      }
    } else if (lastAction === "like") {
      resultsText += `liked diagram${count !== 1 ? "s" : ""}`;
    }
    
    if (selectedTagFilter) {
      resultsText += ` • Filtered by: ${selectedTagFilter}`;
    }
    
    if (diagramTypeFilter !== "all") {
      resultsText += ` • Type: ${diagramTypeFilter}`;
    }
    
    return resultsText;
  };

  const getLayoutGridClasses = () => {
    // Enhanced responsive grid - adjusts columns for different screen sizes
    return {
      "grid gap-3 md:gap-4": true,
      "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5": viewMode === "grid",
      "grid-cols-1": viewMode === "list",
    };
  };

  // Export formats
  const exportFormats = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "svg", label: "SVG" },
    { value: "pdf", label: "PDF" },
  ];

  // Determine if we should show the "Load More" button
  const shouldShowLoadMore = 
    visibleResults.length < currentBatch.length || 
    (hasMore && visibleResults.length >= initialVisibleCount);

  return (
    <div className="relative">
      <div className="px-4 pb-6 md:px-6">
        {searchTerm && (
          <div className="flex flex-wrap items-center justify-between space-y-2 sm:space-y-0 mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    {results.length === 0 ? 'No results' : 'Results'} for "{searchTerm}"
                  </>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {results.length > 0 && `Found ${results.length} diagrams`}
              </p>
            </div>
            
            <div className="flex gap-2">
              {tags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      Filter <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={selectedTagFilter || "all"}
            onValueChange={(value) => {
                        onSelectTagFilter?.(value === "all" ? null : value);
                      }}
                    >
                      <DropdownMenuRadioItem value="all">
                        All Results
                      </DropdownMenuRadioItem>
                      <DropdownMenuSeparator />
                      {tags.map((tag) => (
                        <DropdownMenuRadioItem key={tag} value={tag}>
                          {tag}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {viewMode === "grid" ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                    checked={viewMode === "grid"}
                    onCheckedChange={() => setViewMode("grid")}
                >
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Grid
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={viewMode === "list"}
                    onCheckedChange={() => setViewMode("list")}
                  >
                    <List className="mr-2 h-4 w-4" />
                    List
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="relevant">
                      Most Relevant
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="popular">
                      Most Popular
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="newest">
                      Newest First
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {searchTerm && (
          <Button
                variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={onNewSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  New Search
          </Button>
              )}
      </div>
          </div>
        )}
        
        {results.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid" ? getLayoutGridClasses() : "flex flex-col space-y-4"
            )}
          >
            {visibleResults.map((result, index) => {
              const isLastItem = index === visibleResults.length - 1;
                return (
                <DiagramCard
                    key={`${result.id}-${index}`}
                  diagram={result}
                  viewMode={viewMode}
                  onLike={() => onLike?.(result.id)}
                    isLiked={likedDiagrams.has(String(result.id))}
                  onShare={() => handleShare(result.id)}
                  onDownload={handleDownload}
                  ref={isLastItem ? lastDiagramRef : undefined}
                />
                );
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              ) : error ? (
                <>
                  <div className="text-red-500 mb-2">Error loading results</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {error.message}
                  </p>
                  <Button onClick={onNewSearch}>Try Again</Button>
                </>
              ) : (
                <>
                  <Search className="h-8 w-8 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "No results found. Try a different search term."
                      : "Enter a search term to find diagrams."}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Explicit Load More button */}
        {results.length > 0 && hasMore && (
          <div className="flex justify-center mt-8 mb-4">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={isLoadingMore}
              className="min-w-[180px]"
                >
                  {isLoadingMore ? (
                    <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Loading...
                    </>
                  ) : (
                    <>
                  Show 8 More Results
                  <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
            </div>
          )}
        </div>
    </div>
  );
}