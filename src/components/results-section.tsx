
import { useState, useRef, useEffect } from "react";
import { SimpleSearchBar } from "./simple-search-bar";
import { DiagramCard } from "./diagram-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Filter, SlidersHorizontal, Grid, GridIcon, LayoutGrid } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DiagramResult } from "@/hooks/use-infinite-search";

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction: "search" | "generate";
  onSaveDiagram: (diagramId: string | number) => void;
  savedDiagrams?: Set<string>;
  lastResultRef?: (node: HTMLDivElement | null) => void;
}

export function ResultsSection({ 
  results, 
  searchTerm, 
  onNewSearch, 
  isLoading,
  lastAction,
  onSaveDiagram,
  savedDiagrams = new Set<string>(),
  lastResultRef
}: ResultsSectionProps) {
  const [layoutType, setLayoutType] = useState<"grid" | "masonry">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Filter states
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const childVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  // Get filtered and sorted results
  const getFilteredResults = () => {
    let filtered = [...results];
    
    // Apply type filter
    if (typeFilter !== "all") {
      if (typeFilter === "ai-generated") {
        filtered = filtered.filter(r => r.isGenerated);
      } else if (typeFilter === "web") {
        filtered = filtered.filter(r => !r.isGenerated);
      }
    }
    
    // Apply source filter
    if (sourceFilter !== "all" && sourceFilter !== "") {
      filtered = filtered.filter(r => 
        r.author?.toLowerCase().includes(sourceFilter.toLowerCase()) ||
        r.authorUsername?.toLowerCase().includes(sourceFilter.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      // Since we don't have real timestamps, use the id if it contains a timestamp
      filtered.sort((a, b) => {
        const idA = String(a.id);
        const idB = String(b.id);
        // Extract timestamps if they exist in the ID
        const timestampA = idA.match(/\d{13}/);
        const timestampB = idB.match(/\d{13}/);
        
        if (timestampA && timestampB) {
          return parseInt(timestampB[0]) - parseInt(timestampA[0]);
        }
        return 0;
      });
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => {
        const idA = String(a.id);
        const idB = String(b.id);
        const timestampA = idA.match(/\d{13}/);
        const timestampB = idB.match(/\d{13}/);
        
        if (timestampA && timestampB) {
          return parseInt(timestampA[0]) - parseInt(timestampB[0]);
        }
        return 0;
      });
    }
    
    return filtered;
  };
  
  const filteredResults = getFilteredResults();
  
  return (
    <div className="container max-w-screen-xl mx-auto pt-8 pb-16 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNewSearch}
            className="mr-2 h-8 w-8 p-0"
            aria-label="Back to search"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {lastAction === "search" ? (
              <>Results for <span className="text-primary">"{searchTerm}"</span></>
            ) : (
              <>Generated diagrams for <span className="text-primary">"{searchTerm}"</span></>
            )}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          
          <div className="hidden sm:flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={layoutType === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 rounded-none p-0"
              onClick={() => setLayoutType("grid")}
              title="Grid layout"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutType === "masonry" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 rounded-none p-0"
              onClick={() => setLayoutType("masonry")}
              title="Masonry layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {filterOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-muted/30 rounded-lg p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="web">Web search results</SelectItem>
                  <SelectItem value="ai-generated">AI-generated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {results
                    .map(r => r.author)
                    .filter((author, index, self) => 
                      author && self.findIndex(a => a === author) === index
                    )
                    .map(author => (
                      <SelectItem key={author} value={author || ""}>
                        {author}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 sm:hidden">
              <label className="block text-sm font-medium mb-1">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="mb-6">
        <SimpleSearchBar onSearch={(query, mode) => {
          // Reset and search again
          onNewSearch();
          setTimeout(() => {
            
          }, 100);
        }} isLoading={isLoading} />
      </div>
      
      {/* Search Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">
            {lastAction === "search" ? "Searching for diagrams..." : "Generating diagrams..."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a moment, please wait...
          </p>
        </div>
      )}
      
      {/* No Results State */}
      {!isLoading && filteredResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any diagrams matching your search criteria. Try different keywords or filters.
          </p>
          <Button className="mt-6" onClick={onNewSearch}>
            Try Another Search
          </Button>
        </div>
      )}
      
      {/* Results Grid */}
      {!isLoading && filteredResults.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid ${
            layoutType === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          } gap-6`}
        >
          {filteredResults.map((result, index) => {
            // Calculate if this is the last element for infinite scroll
            const isLastItem = index === filteredResults.length - 1;
            
            return (
              <motion.div
                key={result.id}
                variants={childVariants}
                ref={isLastItem ? lastResultRef : null}
                className={layoutType === "masonry" ? `${index % 3 === 0 ? "sm:col-span-2" : ""}` : ""}
              >
                <DiagramCard
                  title={result.title}
                  imageSrc={result.imageSrc}
                  author={result.author}
                  authorUsername={result.authorUsername}
                  tags={result.tags}
                  sourceUrl={result.sourceUrl}
                  isGenerated={result.isGenerated}
                  isSaved={savedDiagrams.has(String(result.id))}
                  onSave={() => onSaveDiagram(result.id)}
                  aspectRatio={layoutType === "masonry" ? (index % 5 === 0 ? 16/10 : index % 3 === 0 ? 16/14 : 16/9) : 16/9}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
