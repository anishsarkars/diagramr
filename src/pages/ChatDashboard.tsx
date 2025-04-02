
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { motion } from "framer-motion";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { ResultsSection } from "@/components/results-section";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Search, ArrowRight, Sparkles, Book, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ChatDashboard() {
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [animateSearchBar, setAnimateSearchBar] = useState(false);
  
  const searchBarRef = useRef<HTMLDivElement>(null);
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
    error,
    resetSearch
  } = useInfiniteSearch({
    pageSize: 16
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
    
    // Animate search bar after a delay
    setTimeout(() => {
      setAnimateSearchBar(true);
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
    
    setQuery(searchQuery);
    
    try {
      await searchFor(searchQuery);
      
      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      // Scroll to results
      setTimeout(() => {
        if (searchBarRef.current) {
          searchBarRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
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
  
  const exampleSearchQueries = [
    "human anatomy diagrams",
    "molecular structure visualization",
    "physics force diagrams",
    "data structures and algorithms",
    "circuit design diagrams"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container max-w-5xl mx-auto px-4 pt-8 pb-20 flex-1 flex flex-col">
          {!searchTerm ? (
            // Chat-like UI dashboard
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6"
              >
                <DiagramrLogo size="lg" showBeta />
              </motion.div>
              
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-center mb-4"
              >
                Find the Perfect Diagrams
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-muted-foreground text-center mb-8 max-w-2xl"
              >
                Search for educational diagrams, charts, and visualizations to enhance your studies and research.
              </motion.p>
              
              <motion.div
                ref={searchBarRef}
                initial={{ y: 20, opacity: 0, width: "100%" }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  width: "100%",
                  scale: animateSearchBar ? [1, 1.02, 1] : 1
                }}
                transition={{ 
                  delay: 0.5, 
                  duration: 0.5,
                  scale: {
                    duration: 1,
                    repeat: 3,
                    repeatType: "reverse"
                  }
                }}
                className="w-full max-w-2xl mx-auto mb-8"
              >
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="What diagrams are you looking for?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-20 py-6 text-lg rounded-full border-primary/20 focus:border-primary shadow-lg focus:ring-primary/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && query.trim()) {
                        handleSearch(query);
                      }
                    }}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Button
                    onClick={() => handleSearch(query)}
                    disabled={!query.trim()}
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full px-4"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
              
              {/* Recent searches */}
              {searchHistory.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="w-full max-w-2xl mx-auto mb-8"
                >
                  <h3 className="text-sm text-muted-foreground mb-2">Recent searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-sm"
                        onClick={() => handleSearch(item)}
                      >
                        <Search className="mr-1 h-3 w-3" />
                        {item}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Example queries */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="w-full max-w-3xl mx-auto"
              >
                <h3 className="text-sm text-muted-foreground mb-2 text-center">Try these examples</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {exampleSearchQueries.map((example, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left p-4 rounded-xl border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                        onClick={() => handleSearch(example)}
                      >
                        {index % 2 === 0 ? 
                          <Book className="h-4 w-4 mr-2 text-primary/70" /> : 
                          <Image className="h-4 w-4 mr-2 text-primary/70" />}
                        {example}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
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
        
        {/* Input box at bottom for chat-like interface */}
        {searchTerm && (
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t z-40">
            <div className="container max-w-5xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for more diagrams or try a new query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-16 py-3 rounded-full border-primary/20 focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      handleSearch(query);
                    }
                  }}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Button
                  onClick={() => handleSearch(query)}
                  disabled={!query.trim()}
                  size="sm"
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-3"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
