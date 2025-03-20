
import { DiagramResult } from "@/hooks/use-infinite-search";
import { Button } from "@/components/ui/button";
import { DiagramCard } from "@/components/diagram-card";
import { Badge } from "@/components/ui/badge";
import { 
  SearchIcon, 
  Loader2Icon, 
  FilterIcon,
  Wand2Icon, 
  AlertCircleIcon,
  SlidersHorizontal,
  Sparkles,
  DownloadIcon,
  HomeIcon,
  YoutubeIcon,
  BookOpenIcon,
  LinkIcon,
  GraduationCapIcon
} from "lucide-react";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedContainer } from "@/components/animated-container";
import { useInView } from "react-intersection-observer";
import { DiagramPreviewModal } from "@/components/diagram-preview-modal";
import { useTheme } from "@/components/theme-provider";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction: "search" | "generate";
  onLike?: (id: string | number) => void;
  likedDiagrams?: Set<string>;
  lastResultRef?: (node: HTMLDivElement) => void;
  hasMore: boolean;
}

interface EducationalResource {
  id: string;
  title: string;
  type: "video" | "article" | "tutorial";
  url: string;
  platform: string;
  thumbnail?: string;
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
  hasMore
}: ResultsSectionProps) {
  const [sortOption, setSortOption] = useState<"relevance" | "newest">("relevance");
  const [filterOption, setFilterOption] = useState<"all" | "generated" | "search">("all");
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true });
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [educationalResources, setEducationalResources] = useState<EducationalResource[]>([]);
  const [showResources, setShowResources] = useState(false);
  const [apiQuotaExhausted, setApiQuotaExhausted] = useState(false);

  const isLiked = (id: string | number) => likedDiagrams.has(String(id));

  const handleLike = (id: string | number) => {
    if (onLike) {
      onLike(id);
    }
  };
  
  const openDiagramPreview = (diagram: DiagramResult) => {
    setSelectedDiagram(diagram);
    setPreviewOpen(true);
  };
  
  const closeDiagramPreview = () => {
    setPreviewOpen(false);
  };
  
  const goToHome = () => {
    onNewSearch();
  };
  
  const filteredResults = results.filter(result => {
    if (filterOption === "all") return true;
    if (filterOption === "generated") return result.isGenerated;
    if (filterOption === "search") return !result.isGenerated;
    return true;
  });

  // Generate educational resources based on search term
  useEffect(() => {
    if (!searchTerm) return;
    
    // Check for API quota exhaustion based on network errors
    const checkForAPIQuotaIssues = () => {
      // We'll consider the API quota exhausted if we see specific errors in console logs
      const consoleErrors = [];
      const originalConsoleError = console.error;
      console.error = (...args) => {
        consoleErrors.push(args.join(' '));
        originalConsoleError(...args);
      };
      
      // Restore original console.error after 1 second
      setTimeout(() => {
        console.error = originalConsoleError;
        const quotaErrors = consoleErrors.filter(err => 
          err.includes('quota') || 
          err.includes('rate limit') || 
          err.includes('429')
        );
        
        if (quotaErrors.length > 0) {
          setApiQuotaExhausted(true);
        }
      }, 1000);
    };
    
    checkForAPIQuotaIssues();
    
    // Generate educational resources based on the search term
    const generateEducationalResources = (query: string): EducationalResource[] => {
      const lowerQuery = query.toLowerCase();
      
      // Educational resources for different diagram categories
      const resources: { [key: string]: EducationalResource[] } = {
        // UML and software engineering
        "uml": [
          {
            id: "uml-video-1",
            title: "UML Class Diagram Tutorial",
            type: "video",
            url: "https://www.youtube.com/watch?v=UI6lqHOVHic",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/UI6lqHOVHic/mqdefault.jpg"
          },
          {
            id: "uml-article-1",
            title: "UML Class Diagram Comprehensive Guide",
            type: "article",
            url: "https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-class-diagram-tutorial/",
            platform: "Visual Paradigm",
          },
          {
            id: "uml-tutorial-1",
            title: "Interactive UML Diagram Tutorial",
            type: "tutorial",
            url: "https://www.lucidchart.com/pages/uml-class-diagram",
            platform: "Lucidchart",
          }
        ],
        
        // Database diagrams
        "database": [
          {
            id: "database-video-1",
            title: "Entity Relationship Diagram (ERD) Tutorial",
            type: "video",
            url: "https://www.youtube.com/watch?v=QpdhBUYk7Kk",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/QpdhBUYk7Kk/mqdefault.jpg"
          },
          {
            id: "database-article-1",
            title: "Database Schema Design Best Practices",
            type: "article",
            url: "https://www.lucidchart.com/pages/database-diagram/database-design",
            platform: "Lucidchart",
          },
          {
            id: "database-tutorial-1",
            title: "Interactive Database Schema Tutorial",
            type: "tutorial",
            url: "https://www.vertabelo.com/blog/getting-started-with-vertabelo/",
            platform: "Vertabelo",
          }
        ],
        
        // Network diagrams
        "network": [
          {
            id: "network-video-1",
            title: "Network Topology Diagram Tutorial",
            type: "video",
            url: "https://www.youtube.com/watch?v=6G14NrjekLQ",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/6G14NrjekLQ/mqdefault.jpg"
          },
          {
            id: "network-article-1",
            title: "Network Topology Guide with Examples",
            type: "article",
            url: "https://www.lucidchart.com/pages/network-diagram/network-topology-diagram",
            platform: "Lucidchart",
          },
          {
            id: "network-tutorial-1",
            title: "Create Professional Network Diagrams",
            type: "tutorial",
            url: "https://www.edrawsoft.com/networkdiagram/",
            platform: "EdrawMax",
          }
        ],
        
        // System architecture
        "architecture": [
          {
            id: "architecture-video-1",
            title: "System Design Interview: Architecture Diagrams",
            type: "video",
            url: "https://www.youtube.com/watch?v=i_Q6tu-JFz8",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/i_Q6tu-JFz8/mqdefault.jpg"
          },
          {
            id: "architecture-article-1",
            title: "System Architecture Design Patterns",
            type: "article",
            url: "https://martinfowler.com/architecture/",
            platform: "Martin Fowler",
          },
          {
            id: "architecture-tutorial-1",
            title: "Interactive C4 Architecture Tutorial",
            type: "tutorial",
            url: "https://c4model.com/",
            platform: "C4 Model",
          }
        ],
        
        // Default/general diagrams
        "default": [
          {
            id: "general-video-1",
            title: "How to Create Professional Diagrams",
            type: "video",
            url: "https://www.youtube.com/watch?v=WC1ztqw69_Y",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/WC1ztqw69_Y/mqdefault.jpg"
          },
          {
            id: "general-article-1",
            title: "The Ultimate Guide to Diagram Types",
            type: "article",
            url: "https://www.lucidchart.com/blog/types-of-diagrams",
            platform: "Lucidchart",
          },
          {
            id: "general-tutorial-1",
            title: "Learn to Create Effective Diagrams",
            type: "tutorial",
            url: "https://www.draw.io/",
            platform: "draw.io",
          }
        ]
      };
      
      // Determine which category resources to show
      let category = "default";
      
      if (lowerQuery.includes("uml") || 
          lowerQuery.includes("class diagram") || 
          lowerQuery.includes("sequence diagram")) {
        category = "uml";
      } else if (lowerQuery.includes("database") || 
                lowerQuery.includes("er diagram") || 
                lowerQuery.includes("entity relationship")) {
        category = "database";
      } else if (lowerQuery.includes("network") || 
                lowerQuery.includes("topology") || 
                lowerQuery.includes("infrastructure")) {
        category = "network";
      } else if (lowerQuery.includes("architecture") || 
                lowerQuery.includes("system design") || 
                lowerQuery.includes("microservices")) {
        category = "architecture";
      }
      
      return resources[category] || resources.default;
    };
    
    // Set educational resources and show them if there are search results
    const newResources = generateEducationalResources(searchTerm);
    setEducationalResources(newResources);
    setShowResources(filteredResults.length > 0);
  }, [searchTerm, filteredResults.length]);

  return (
    <div className="container py-8 pb-16">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToHome}
            className="mr-2 hidden md:flex"
          >
            <HomeIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToHome}
            className="mr-2 md:hidden"
          >
            <HomeIcon className="h-4 w-4 mr-1.5" />
            <span>Home</span>
          </Button>
          
          <motion.div
            ref={titleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn(
                "px-2 py-0.5",
                isDarkMode 
                  ? "bg-primary/20 text-primary border-primary/30" 
                  : "bg-primary/5 text-primary border-primary/20"
              )}>
                {lastAction === "search" ? "Search Results" : "AI Generated"}
              </Badge>
              {lastAction === "generate" && (
                <Badge variant="outline" className="bg-secondary/40">Beta</Badge>
              )}
              
              {apiQuotaExhausted && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-[10px]">
                  API quota exceeded
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{searchTerm}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isLoading ? (
                "Finding the best diagrams..."
              ) : filteredResults.length > 0 ? (
                `Found ${filteredResults.length} diagram${filteredResults.length > 1 ? "s" : ""}`
              ) : (
                "No diagrams found. Try a different search term."
              )}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <SimpleSearchBar onSearch={onNewSearch} />
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={filterOption === "all" ? "default" : "outline"} 
            className="px-3 py-1 cursor-pointer"
            onClick={() => setFilterOption("all")}
          >
            All
          </Badge>
          <Badge 
            variant={filterOption === "search" ? "default" : "outline"} 
            className="px-3 py-1 cursor-pointer"
            onClick={() => setFilterOption("search")}
          >
            <SearchIcon className="h-3 w-3 mr-1" />
            Search Results
          </Badge>
          <Badge 
            variant={filterOption === "generated" ? "default" : "outline"} 
            className="px-3 py-1 cursor-pointer"
            onClick={() => setFilterOption("generated")}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Generated
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Sort by:</span>
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

      {/* Educational Resources Section */}
      {showResources && educationalResources.length > 0 && !isLoading && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <GraduationCapIcon className="h-5 w-5 mr-2 text-primary" />
              Educational Resources for "{searchTerm}"
            </h2>
            <Badge variant="outline" className="text-xs">Free Learning</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {educationalResources.map(resource => (
              <Card key={resource.id} className="hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    {resource.type === "video" && <YoutubeIcon className="h-4 w-4 mr-2 text-red-500" />}
                    {resource.type === "article" && <BookOpenIcon className="h-4 w-4 mr-2 text-blue-500" />}
                    {resource.type === "tutorial" && <GraduationCapIcon className="h-4 w-4 mr-2 text-green-500" />}
                    {resource.title}
                  </CardTitle>
                  <CardDescription>{resource.platform}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {resource.thumbnail && resource.type === "video" && (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted mb-2">
                      <img 
                        src={resource.thumbnail} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                      Visit {resource.type === "video" ? "Video" : resource.type === "article" ? "Article" : "Tutorial"}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

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
        ) : filteredResults.length === 0 ? (
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
            {filteredResults.map((result, index) => {
              // Check if this is the last item to attach the ref for infinite scrolling
              if (filteredResults.length === index + 1) {
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
                      onClick={() => openDiagramPreview(result)}
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
                    onClick={() => openDiagramPreview(result)}
                  />
                );
              }
            })}
          </div>
        )}
      </AnimatePresence>
      
      {/* Loading more results indicator */}
      {!isLoading && filteredResults.length > 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading more results...</span>
          </div>
        </div>
      )}
      
      {/* API quota notice */}
      {apiQuotaExhausted && !isLoading && (
        <div className="mt-4 text-center">
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
            API daily quota exceeded. Some results may be limited.
          </Badge>
        </div>
      )}
      
      {!isLoading && filteredResults.length > 0 && !hasMore && (
        <div className="text-center mt-8 py-4">
          <p className="text-muted-foreground text-sm">You've reached the end of the results</p>
          <Button variant="outline" onClick={onNewSearch} className="mt-4">
            New Search
          </Button>
        </div>
      )}
      
      {/* Diagram preview modal */}
      <DiagramPreviewModal
        open={previewOpen}
        onClose={closeDiagramPreview}
        diagram={selectedDiagram}
        onLike={selectedDiagram ? () => handleLike(selectedDiagram.id) : undefined}
        isLiked={selectedDiagram ? isLiked(selectedDiagram.id) : false}
      />
    </div>
  );
}

// Import cn function
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
