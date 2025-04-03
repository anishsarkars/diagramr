
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { ResultsSection } from "@/components/results-section";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Search, ArrowRight, Plus, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function ChatDashboard() {
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { incrementCount, hasReachedLimit, remainingSearches } = useSearchLimit();
  
  const { 
    results,
    isLoading,
    hasMore,
    loadMore,
    searchTerm,
    searchFor,
    resetSearch
  } = useInfiniteSearch({
    pageSize: 20
  });
  
  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('diagramr-search-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
      } catch (e) {
        console.error('Error parsing search history:', e);
      }
    }
    
    // Fetch liked diagrams
    if (user) {
      fetchLikedDiagrams();
    }
    
    // Focus the input field when the page loads
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  }, [user]);
  
  const fetchLikedDiagrams = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_diagrams')
        .select('diagram_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const likedIds = new Set(data.map(item => item.diagram_id));
        setLikedDiagrams(likedIds);
      }
    } catch (error) {
      console.error('Error fetching liked diagrams:', error);
    }
  };
  
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    if (hasReachedLimit) {
      toast.info("You've reached your daily search limit!", {
        description: "Upgrade to Pro for 50+ searches per day",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing")
        }
      });
      return;
    }
    
    const success = await incrementCount();
    if (!success) return;
    
    setQuery("");
    
    try {
      await searchFor(searchQuery);
      
      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error("Search error:", error);
    }
  };
  
  const handleNewSearch = () => {
    resetSearch();
    setSelectedTagFilter(null);
  };
  
  const handleLikeDiagram = async (diagramId: string | number) => {
    if (!user) {
      toast.info("Please sign in to save diagrams");
      return;
    }
    
    try {
      const diagramToLike = results.find(r => r.id === diagramId);
      if (diagramToLike) {
        const isLiked = likedDiagrams.has(String(diagramId));
        
        if (isLiked) {
          const { error } = await supabase
            .from('saved_diagrams')
            .delete()
            .eq('user_id', user.id)
            .eq('diagram_id', String(diagramId));
          
          if (error) throw error;
          
          const newLiked = new Set(likedDiagrams);
          newLiked.delete(String(diagramId));
          setLikedDiagrams(newLiked);
          
          toast.success("Diagram removed from favorites");
        } else {
          const diagramData = {
            id: String(diagramToLike.id),
            title: diagramToLike.title,
            imageSrc: diagramToLike.imageSrc,
            author: diagramToLike.author || "",
            authorUsername: diagramToLike.authorUsername || "",
            tags: diagramToLike.tags || [],
            sourceUrl: diagramToLike.sourceUrl || "",
            isGenerated: diagramToLike.isGenerated || false
          };
          
          const { error } = await supabase
            .from('saved_diagrams')
            .insert({
              user_id: user.id,
              diagram_id: String(diagramId),
              diagram_data: diagramData
            });
          
          if (error) throw error;
          
          const newLiked = new Set(likedDiagrams);
          newLiked.add(String(diagramId));
          setLikedDiagrams(newLiked);
          
          toast.success("Diagram saved to favorites");
        }
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast.error('Failed to update liked diagrams');
    }
  };
  
  const exampleSearches = [
    "Human anatomy diagrams",
    "Molecular structure visualization",
    "Physics force diagrams", 
    "Data flow architecture",
    "Circuit design diagrams"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 pt-12 pb-24 flex-1 flex flex-col">
          {!searchTerm ? (
            // Empty state with chat-like interface
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl font-serif font-bold mb-3">Find your diagrams</h1>
                  <p className="text-muted-foreground mb-8">
                    Search for educational diagrams, charts, and visualizations
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-10"
                >
                  <div className="relative w-full mb-6">
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl"></div>
                    <div className="relative flex items-center">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="What diagrams are you looking for?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-24 py-7 text-lg rounded-2xl border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && query.trim()) {
                            handleSearch(query);
                          }
                        }}
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                      <Button
                        onClick={() => handleSearch(query)}
                        disabled={!query.trim() || isLoading}
                        size="lg"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl px-5 py-6 gap-2"
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            <span>Search</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="text-sm text-muted-foreground mb-4">Try searching for:</div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                    {exampleSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="rounded-full text-sm border-primary/20 hover:bg-primary/5 transition-colors"
                        onClick={() => handleSearch(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            // Results section
            <ResultsSection 
              results={results} 
              searchTerm={searchTerm} 
              onNewSearch={handleNewSearch} 
              onSearch={handleSearch}
              isLoading={isLoading}
              lastAction="search"
              onLike={handleLikeDiagram}
              likedDiagrams={likedDiagrams}
              hasMore={hasMore}
              loadMore={loadMore}
              selectedTagFilter={selectedTagFilter}
              onSelectTagFilter={setSelectedTagFilter}
            />
          )}
        </div>
        
        {/* Improved input box at bottom for chat-like interface */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t z-40">
          <div className="container max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-md opacity-50"></div>
              <div className="relative flex items-center">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for diagrams..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-16 py-5 rounded-full border-border/50 focus:border-primary focus:ring-1 focus:ring-primary shadow-md"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      handleSearch(query);
                    }
                  }}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                <Button
                  onClick={() => handleSearch(query)}
                  disabled={!query.trim() || isLoading}
                  size="sm"
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 p-0"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
