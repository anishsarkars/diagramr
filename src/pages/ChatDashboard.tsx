import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { ResultsSection } from "@/components/results-section";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Search, ArrowUp, Loader2, MessageSquare, X, Settings, Heart, User, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PopularSearches } from "@/components/popular-searches";

export default function ChatDashboard() {
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [userGreeting, setUserGreeting] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
    pageSize: 12
  });

  // Function to determine greeting based on time of day
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    
    // Add user name if available
    if (user?.user_metadata?.name) {
      greeting += `, ${user.user_metadata.name}`;
    } else if (user?.email) {
      // Use the part before @ in email
      const name = user.email.split('@')[0];
      greeting += `, ${name}`;
    }
    
    return greeting;
  }, [user]);
  
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
    
    // Set user greeting
    setUserGreeting(getGreeting());
    
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
    
    // Show welcome confetti for new users
    const hasSeenWelcome = localStorage.getItem('diagramr-welcomed');
    if (!hasSeenWelcome && user) {
      setShowConfetti(true);
      localStorage.setItem('diagramr-welcomed', 'true');
      
      toast.success("Welcome to Diagramr!", {
        description: "Find beautiful diagrams with AI assistance",
        duration: 3000,
      });
    }
  }, [user, getGreeting]);
  
  // Create an observer for infinite scrolling
  const lastDiagramRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || !hasMore || isLoading) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log("Intersection observed, loading more...");
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);
  
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
    
    console.log(`Starting search for: "${searchQuery}"`);
    
    try {
      await searchFor(searchQuery);
      
      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    }
  };
  
  const handleNewSearch = () => {
    resetSearch();
    setSelectedTagFilter(null);
    // Focus on the input after resetting search
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1500);
        }
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast.error('Failed to update liked diagrams');
    }
  };

  // For debugging
  useEffect(() => {
    console.log("Results updated:", results.length);
    console.log("Has more:", hasMore);
  }, [results, hasMore]);

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2">
            <DiagramrLogo size="sm" />
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/liked')}
            >
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/account')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-9 w-9 p-0 overflow-hidden">
                  <Avatar className="h-9 w-9 transition-all hover:ring-2 hover:ring-primary/20">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="font-medium">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/liked')}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Liked Diagrams</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 pt-8 pb-20 flex-1 flex flex-col">
          {!searchTerm ? (
            // Empty state with Grok-like interface
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <h1 className="text-4xl font-serif font-medium mb-2">{userGreeting}</h1>
                  <p className="text-2xl text-muted-foreground">
                    How can I help you find diagrams today?
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-10"
                >
                  <div className="relative w-full mb-8">
                    <div className="relative flex items-center">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="What diagrams are you looking for?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-14 py-7 text-lg rounded-2xl border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-md bg-background"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && query.trim()) {
                            handleSearch(query);
                          }
                        }}
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      
                      {query ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setQuery("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleSearch(query)}
                    disabled={!query.trim() || isLoading}
                    className="px-8 py-6 text-base rounded-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Search className="h-5 w-5 mr-2" />
                    )}
                    Search Diagrams
                  </Button>
                  
                  <div className="mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => setShowTips(true)}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Search Tips
                    </Button>
                  </div>
                </motion.div>
                
                {/* Recent searches */}
                {searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="h-px flex-1 bg-border/50"></div>
                      <span className="text-sm text-muted-foreground px-2">Recent Searches</span>
                      <div className="h-px flex-1 bg-border/50"></div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: 0.4 + (index * 0.1) }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-sm"
                            onClick={() => handleSearch(item)}
                          >
                            {item}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Popular searches bento grid */}
                <PopularSearches onSelect={handleSearch} />
              </div>
            </div>
          ) : (
            // Results section
            <div className="w-full">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-medium mb-1">Results for "{searchTerm}"</h2>
                  <p className="text-sm text-muted-foreground">
                    Showing {results.length} diagrams
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleNewSearch}
                  className="self-start"
                >
                  New Search
                </Button>
              </div>
              
              {/* Debug info for load more troubleshooting */}
              {/* <div className="text-xs text-muted-foreground mb-4">
                Results: {results.length} | Has more: {hasMore ? "Yes" : "No"} | Loading: {isLoading ? "Yes" : "No"}
              </div> */}
              
              {/* Bento grid layout for search results */}
              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {results.map((diagram, index) => {
                    // Add ref to last item for infinite scroll
                    const isLastItem = index === results.length - 1;
                    
                    return (
                      <motion.div 
                        key={diagram.id}
                        ref={isLastItem ? lastDiagramRef : null}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { 
                            delay: Math.min(0.1 * (index % 6), 0.5)
                          }
                        }}
                        className="group relative"
                      >
                        <div className="diagram-card overflow-hidden rounded-xl border hover:border-primary/50 transition-all">
                          <div className="diagram-card-image">
                            <img 
                              src={diagram.imageSrc} 
                              alt={diagram.title}
                              className="object-cover w-full h-full aspect-video"
                              loading={index < 6 ? "eager" : "lazy"}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <h3 className="text-white font-medium line-clamp-1">{diagram.title}</h3>
                            </div>
                            
                            <Button
                              variant="default"
                              size="icon"
                              className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8 ${
                                likedDiagrams.has(String(diagram.id)) ? 'bg-primary/90 hover:bg-primary/80' : 'bg-primary/80 hover:bg-primary'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeDiagram(diagram.id);
                              }}
                            >
                              <Heart 
                                className={`h-4 w-4 ${likedDiagrams.has(String(diagram.id)) ? 'fill-white' : ''}`} 
                              />
                            </Button>
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-medium line-clamp-1 mb-1">{diagram.title}</h3>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {diagram.tags && diagram.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                <Button
                                  key={tagIndex}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs rounded-full border-primary/30 hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTagFilter(tag);
                                  }}
                                >
                                  {tag}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Searching for diagrams...</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">No diagrams found</p>
                    <p className="text-muted-foreground mb-6">Try a different search term or check out some suggested topics</p>
                    <Button onClick={handleNewSearch}>Try Another Search</Button>
                  </div>
                </div>
              )}
              
              {/* Load more indicator */}
              {hasMore && results.length > 0 && (
                <div className="flex justify-center py-8">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={loadMore}
                      className="px-8"
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}
              
              {/* Debug element for intersection observer */}
              <div ref={resultsEndRef} className="h-4 mb-8"></div>
            </div>
          )}
        </div>
        
        {/* Search input at bottom for quick access */}
        {searchTerm && (
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t z-40">
            <div className="container max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for more diagrams..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-16 py-5 rounded-full border-border/50 focus:border-primary focus:ring-1 focus:ring-primary shadow-md"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      handleSearch(query);
                    }
                  }}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Button
                  onClick={() => handleSearch(query)}
                  disabled={!query.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Confetti celebration */}
      {showConfetti && <ConfettiCelebration particleCount={25} duration={1500} onComplete={() => setShowConfetti(false)} />}
      
      {/* Tips dialog */}
      <Dialog open={showTips} onOpenChange={setShowTips}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tips for better search results</DialogTitle>
            <DialogDescription>
              Get the most out of Diagramr with these search strategies
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4 pr-2">
              <div>
                <h3 className="font-medium mb-1">Be specific about diagram type</h3>
                <p className="text-sm text-muted-foreground">
                  Example: "UML class diagram for e-commerce" instead of just "e-commerce diagram"
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Include domain or industry</h3>
                <p className="text-sm text-muted-foreground">
                  Example: "Database schema for healthcare app" or "Network topology for financial institutions"
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Specify complexity level</h3>
                <p className="text-sm text-muted-foreground">
                  Example: "Simple flowchart for beginner programming" or "Advanced system architecture diagram"
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Use technical terms</h3>
                <p className="text-sm text-muted-foreground">
                  AI understands technical language, so use precise terminology when possible
                </p>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowTips(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
