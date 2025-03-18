
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Search,
  ChevronRight,
  RefreshCw,
  Download,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { SearchLimitIndicator } from "@/components/search-limit-indicator";
import { useAuth } from "@/components/auth-context";
import { Badge } from "@/components/ui/badge";
import { DiagramResult } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction?: "search" | "generate";
  onSaveDiagram?: (id: string | number) => void;
  savedDiagrams?: Set<string>;
  lastResultRef?: (node: HTMLDivElement | null) => void;
}

export function ResultsSection({
  results,
  searchTerm,
  onNewSearch,
  isLoading,
  lastAction = "search",
  onSaveDiagram,
  savedDiagrams = new Set(),
  lastResultRef,
}: ResultsSectionProps) {
  const [showDownloadTooltip, setShowDownloadTooltip] = useState<number | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Pass the ref to the parent component for infinite scrolling
  useEffect(() => {
    if (inView && lastResultRef) {
      const lastElement = document.querySelector('.last-result');
      if (lastElement) {
        lastResultRef(lastElement as HTMLDivElement);
      }
    }
  }, [inView, lastResultRef]);

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Diagram downloaded successfully!");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const handleBookmarkClick = (id: string | number) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (onSaveDiagram) {
      onSaveDiagram(id);
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-6">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No results found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        We couldn't find any diagrams matching your search criteria. Try
        different keywords or filters.
      </p>
      <Button size="lg" onClick={onNewSearch}>
        Try Another Search
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <RefreshCw className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {lastAction === "search" ? "Searching for diagrams..." : "Generating your diagram..."}
      </h3>
      <p className="text-muted-foreground max-w-md text-center mb-6">
        {lastAction === "search"
          ? `We're finding the best diagram results for "${searchTerm}"`
          : `Our AI is creating a custom diagram for "${searchTerm}"`}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70 italic mt-4">
        <Clock className="h-3 w-3" />
        <span>
          {lastAction === "search"
            ? "This usually takes a few seconds"
            : "This could take up to 20 seconds"}
        </span>
      </div>
    </div>
  );

  const renderResults = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="pt-4 pb-16"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1 flex items-center gap-2">
            {lastAction === "search" ? (
              <>
                <span>Results for</span>
                <span className="text-primary">"{searchTerm}"</span>
              </>
            ) : (
              <>
                <span>Generated diagram for</span>
                <span className="text-primary">"{searchTerm}"</span>
              </>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {results.length} diagram
            {results.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button variant="outline" onClick={onNewSearch} className="gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">New Search</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            variants={itemVariants}
            className={index === results.length - 1 ? "last-result" : ""}
            ref={index === results.length - 1 ? ref : null}
          >
            <div className="diagram-card overflow-hidden group">
              <div className="diagram-card-image relative">
                <img
                  src={result.imageSrc}
                  alt={result.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300"></div>

                <div className="absolute top-2 right-2 flex gap-1">
                  {result.isGenerated && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto bg-background/80 backdrop-blur-sm">
                      AI-Generated
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => handleBookmarkClick(result.id)}
                  >
                    {savedDiagrams.has(String(result.id)) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => handleDownload(result.imageSrc, result.title)}
                    onMouseEnter={() => setShowDownloadTooltip(Number(result.id))}
                    onMouseLeave={() => setShowDownloadTooltip(null)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {showDownloadTooltip === Number(result.id) && (
                  <div className="absolute bottom-12 right-2 bg-black/70 text-white text-xs py-1 px-2 rounded pointer-events-none">
                    Download
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2">{result.title}</h3>
                
                {result.author && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    By: {result.author}
                  </div>
                )}
                
                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.tags.slice(0, 3).map((tag, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-[0.65rem] px-1.5 py-0 h-auto border-none bg-secondary/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-[0.65rem] text-muted-foreground">
                        +{result.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground italic mb-2">
          Diagramr is in beta and constantly improving. Results may vary in quality and relevance.
        </p>
        
        <Button 
          variant="outline" 
          onClick={onNewSearch} 
          className="mx-auto mt-2"
        >
          New Search
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 pt-8 pb-12">
      <div className="w-full max-w-3xl mx-auto mb-8">
        <SearchLimitIndicator compact className="mx-auto" />
      </div>

      {isLoading ? (
        renderLoading()
      ) : results.length === 0 ? (
        renderEmptyState()
      ) : (
        renderResults()
      )}
    </div>
  );
}
