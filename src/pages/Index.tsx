import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { PersonalizedHome } from "@/components/personalized-home";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useNavigate } from "react-router-dom";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Send, Info, Sparkles, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { PopularSearchesBento } from "@/components/popular-searches-bento";

const Index = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [showSearchField, setShowSearchField] = useState(true);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [isDeviceMobile, setIsDeviceMobile] = useState(false);
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const [suggestionScrollPosition, setSuggestionScrollPosition] = useState(0);
  const [typingSuggestions, setTypingSuggestions] = useState<string[]>([]);
  const [showTypingSuggestions, setShowTypingSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    incrementCount, 
    hasReachedLimit, 
    requiresLogin, 
    remainingSearches,
    loadCounts
  } = useSearchLimit();
  
  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
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
    pageSize: 20 // Increased to show more results initially
  });
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsDeviceMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create an observer for infinite scrolling
  const lastResultRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || !hasMore) return;
    
    if (node) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          console.log("Last item visible, loading more...");
          loadMore();
        }
      }, { threshold: 0.5 });
      
      observer.observe(node);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isLoading, hasMore, loadMore]);

  // Rotating descriptions
  const descriptions = [
    "Access high-quality educational resources",
    "Visualize complex academic concepts",
    "Discover scientific illustrations & charts",
    "Enhance your learning with visual aids",
    "Find educational diagrams for your studies"
  ];

  // Add description rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDescriptionIndex((prevIndex) => (prevIndex + 1) % descriptions.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [descriptions.length]);

  // Add scrolling animation with slower speed for more fluid motion
  useEffect(() => {
    if (!searchTerm) {
      const scrollInterval = setInterval(() => {
        setSuggestionScrollPosition((prev) => prev + 0.08);
      }, 50);
      
      return () => clearInterval(scrollInterval);
    }
  }, [searchTerm]);

  // Simplified scrolling suggestions with only the requested tags
  const scrollingSuggestions = [
    "human anatomy diagrams",
    "molecular structure visualization", 
    "physics force diagrams", 
    "data structures and algorithms",
    "circuit design diagrams",
    "neural network architecture"
  ];

  // Update the popular search suggestions with expanded options for better NLP matching
  const popularSearchSuggestions = [
    "ER Diagram for database design", 
    "Class Diagram for software architecture", 
    "Sequence Diagram showing user authentication", 
    "Flow Chart of business process", 
    "Mind Map for brainstorming ideas", 
    "UML Diagram for system modeling",
    "Circuit Design with resistors and capacitors",
    "Neural Networks architecture visualization",
    "Human Anatomy with labeled organs",
    "Molecular Structure of DNA",
    "Physics Force diagram examples",
    "Data Structures visualization"
  ];

  // Enhanced NLP-like suggestion generation with better handling of context
  useEffect(() => {
    if (searchQuery.trim().length > 1) { // Reduced minimum length to 2 characters
      // More sophisticated suggestions that account for partial matches and context
      const matchedExactSuggestions = scrollingSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Extended suggestions that try to understand intent
      const queryWords = searchQuery.toLowerCase().split(/\s+/);
      const matchedContextualSuggestions = popularSearchSuggestions.filter(suggestion => {
        // Check if any word in query is in the suggestion
        return queryWords.some(word => 
          word.length > 1 && suggestion.toLowerCase().includes(word) // Reduced minimum word length
        );
      });
      
      // Natural language completion suggestions
      let nlpSuggestions: string[] = [];
      
      // Complete the sentence suggestions
      if (searchQuery.toLowerCase().includes("diagram")) {
        nlpSuggestions = [
          `${searchQuery} for education`,
          `${searchQuery} with examples`,
          `${searchQuery} explained visually`,
        ];
      } else if (searchQuery.toLowerCase().includes("chart") || searchQuery.toLowerCase().includes("graph")) {
        nlpSuggestions = [
          `${searchQuery} visualization`,
          `${searchQuery} examples`,
          `interactive ${searchQuery}`,
        ];
      } else if (searchQuery.length > 2) { // Reduced minimum length
        // Domain-specific completions
        const domains = ["biology", "chemistry", "physics", "computer science", "engineering", "math", "data"];
        const domainMatch = domains.find(domain => searchQuery.toLowerCase().includes(domain));
        
        if (domainMatch) {
          nlpSuggestions = [
            `${domainMatch} diagram ${searchQuery.replace(domainMatch, "").trim()}`,
            `${searchQuery} visual representation`,
            `${searchQuery} concept visualization`,
          ];
        } else {
          // Generic completions for short queries
          nlpSuggestions = [
            `${searchQuery} diagram`,
            `${searchQuery} illustration`,
            `${searchQuery} visual guide`,
          ];
        }
      }
      
      // Add common diagram types for any short query
      if (searchQuery.length > 1 && searchQuery.length < 15 && !searchQuery.toLowerCase().includes("diagram")) {
        nlpSuggestions.push(
          `${searchQuery} flowchart`,
          `${searchQuery} mind map`,
          `${searchQuery} concept map`
        );
      }
      
      // Combine and deduplicate all suggestions
      const combinedSuggestions = [...new Set([
        ...matchedExactSuggestions, 
        ...matchedContextualSuggestions,
        ...nlpSuggestions
      ])];
      
      // Filter out suggestions that are too similar to the query itself
      const filteredSuggestions = combinedSuggestions.filter(suggestion => 
        suggestion.toLowerCase() !== searchQuery.toLowerCase() &&
        suggestion.length > searchQuery.length
      );
      
      // Limit to 5 suggestions and show them
      setTypingSuggestions(filteredSuggestions.slice(0, 5));
      setShowTypingSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowTypingSuggestions(false);
    }
  }, [searchQuery]);

  const handleInputFocus = () => {
    setShowTypingSuggestions(typingSuggestions.length > 0);
  };
  
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowTypingSuggestions(false);
    }, 200);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const handleSearch = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    if (hasReachedLimit) {
      // Check if user needs to log in
      if (requiresLogin) {
        if (onLoginClick) {
          // Alert user they need to sign in
          toast.error("Please sign in to continue searching", {
            description: "You've reached the guest search limit.",
            action: {
              label: "Sign In",
              onClick: onLoginClick
            }
          });
        }
      } else {
        // User is logged in but reached their limit
        toast.error("Search limit reached", {
          description: "You've reached your daily search limit. Upgrade to Premium for more searches.",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing")
          }
        });
      }
      return;
    }
    
    // Increment search count
    incrementCount();
    setSearchAttempts(prev => prev + 1);
    
    // Set the search query
    setSearchQuery(prompt);
    
    // Reset search and tag filter
    resetSearch();
    setSelectedTagFilter(null);
    
    // Search for the prompt
    searchFor(prompt);
    
    // Hide suggestions
    setShowTypingSuggestions(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };
  
  const handleClearSearch = () => {
    setSearchQuery("");
    resetSearch();
    setSelectedTagFilter(null);
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleTagFilterSelect = (tag: string | null) => {
    setSelectedTagFilter(tag);
  };
  
  const fetchLikedDiagrams = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('liked_diagrams')
        .select('diagram_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching liked diagrams:', error);
        return;
      }
      
      setLikedDiagrams(new Set(data.map(item => item.diagram_id.toString())));
    } catch (err) {
      console.error('Error in fetchLikedDiagrams:', err);
    }
  }, [user]);
  
  const handleLikeDiagram = async (diagramId: string | number) => {
    if (!user) {
      if (onLoginClick) {
        toast("Please sign in to save diagrams", {
          description: "Create an account to save your favorite diagrams.",
          action: {
            label: "Sign In",
            onClick: onLoginClick
          }
        });
      }
      return;
    }
    
    const stringId = diagramId.toString();
    
    try {
      // Check if already liked
      if (likedDiagrams.has(stringId)) {
        // Unlike: Remove from database
        const { error } = await supabase
          .from('liked_diagrams')
          .delete()
          .eq('user_id', user.id)
          .eq('diagram_id', diagramId);
        
        if (error) throw error;
        
        // Update local state
        const newLiked = new Set(likedDiagrams);
        newLiked.delete(stringId);
        setLikedDiagrams(newLiked);
        
        toast.success("Diagram removed from saved items");
      } else {
        // Like: Add to database
        const { error } = await supabase
          .from('liked_diagrams')
          .insert({
            user_id: user.id,
            diagram_id: diagramId,
            diagram_data: results.find(r => r.id.toString() === stringId)
          });
        
        if (error) throw error;
        
        // Update local state
        const newLiked = new Set(likedDiagrams);
        newLiked.add(stringId);
        setLikedDiagrams(newLiked);
        
        toast.success("Diagram saved to your library");
      }
    } catch (err) {
      console.error('Error toggling like status:', err);
      toast.error("Failed to update saved status");
    }
  };
  
  // Load search limit data
  useEffect(() => {
    loadCounts();
  }, [loadCounts]);
  
  // Load liked diagrams if user is logged in
  useEffect(() => {
    if (user) {
      fetchLikedDiagrams();
    } else {
      setLikedDiagrams(new Set());
    }
  }, [user, fetchLikedDiagrams]);
  
  // Show search limit warning
  useEffect(() => {
    if (remainingSearches === 3) {
      setTimeout(() => {
        toast("Running low on searches", {
          description: "You have only 3 searches remaining today. Sign in for more searches.",
          action: onLoginClick && {
            label: "Sign In",
            onClick: onLoginClick
          }
        });
      }, 500);
    }
  }, [remainingSearches, onLoginClick]);
  
  useEffect(() => {
    if (error && error.message?.includes('API quota exceeded')) {
      toast.error("API quota exceeded", {
        description: "The search service is currently experiencing high demand. Please try again later.",
        duration: 8000,
      });
    }
  }, [error]);

  // Define a function to get a search query from the URL
  const getSearchFromUrl = () => {
    // If we're running in the browser, get the URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('q');
    }
    return null;
  };

  // Check for search query in URL on first render
  useEffect(() => {
    const urlSearchQuery = getSearchFromUrl();
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
      handleSearch(urlSearchQuery);
    }
  }, []);

  const handleNewSearch = () => {
    resetSearch();
    setSearchQuery("");
    setSelectedTagFilter(null);
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden bg-transparent">
      {/* Background gradient effect similar to dreamflow */}
      <div className="fixed inset-0 bg-gradient-to-br from-background/80 via-background to-blue-950/10 z-[-2]" />
      <div className="fixed right-0 top-0 w-full h-full bg-blue-500/5 blur-[120px] z-[-1]" style={{ borderRadius: '70% 30% 70% 30% / 30% 30% 70% 70%' }} />
      <div className="fixed left-0 bottom-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] z-[-1]" style={{ borderRadius: '30% 70% 30% 70% / 70% 30% 70% 30%' }} />
      
      <Header authenticatedRedirect="/dashboard" onLoginClick={onLoginClick} />
      
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-6 md:py-12 max-w-7xl mx-auto">
        {!searchTerm ? (
          /* Home page content when no search is active */
          <>
            <HeroSection 
              onSearch={handleSearch} 
              remainingSearches={remainingSearches}
              requiresLogin={requiresLogin}
              onLoginClick={onLoginClick}
              currentDescriptionIndex={currentDescriptionIndex}
              descriptions={descriptions}
            />
            
            <motion.div 
              className="w-full max-w-3xl mx-auto mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center mb-3">
                <div className="flex-1 h-[1px] bg-border/40" />
                <span className="px-3 text-xs text-muted-foreground">Popular searches</span>
                <div className="flex-1 h-[1px] bg-border/40" />
              </div>
              
              <PopularSearchesBento onSearch={handleSearch} />
            </motion.div>
          </>
        ) : (
          /* Search results when a search is active */
          <div className="w-full">
            {/* Search input field for new searches */}
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for diagrams, charts, or illustrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="h-12 pl-12 pr-12 rounded-full shadow-sm border-input/50 bg-background/50 backdrop-blur-sm"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-14 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={!searchQuery.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
                
                {/* Typing suggestions dropdown */}
                <AnimatePresence>
                  {showTypingSuggestions && typingSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/40 overflow-hidden z-50"
                    >
                      <ul className="py-2">
                        {typingSuggestions.map((suggestion, i) => (
                          <li key={suggestion}>
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <Search className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="line-clamp-1">{suggestion}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center justify-between mt-4 px-2">
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  Search tips
                </button>
                
                {remainingSearches !== null && (
                  <span className="text-xs text-muted-foreground">
                    {remainingSearches} {remainingSearches === 1 ? 'search' : 'searches'} remaining
                  </span>
                )}
              </div>
              
              <AnimatePresence>
                {showTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-muted/30 backdrop-blur-sm mt-2 p-3 rounded-lg border border-border/40"
                  >
                    <p className="text-xs text-muted-foreground mb-1">For better results, try:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Being specific (e.g., "DNA double helix diagram" instead of "DNA")</li>
                      <li>Include diagram type (flowchart, mind map, UML, etc.)</li>
                      <li>Add a domain (biology, physics, computer science)</li>
                      <li>Use natural language (e.g., "Show me flowcharts about...")</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Results section */}
            <ResultsSection
              searchTerm={searchTerm}
              results={results}
              isLoading={isLoading}
              hasMore={hasMore}
              error={error}
              lastResultRef={lastResultRef}
              selectedTagFilter={selectedTagFilter}
              onTagFilterSelect={handleTagFilterSelect}
              loadMore={loadMore}
              onNewSearch={handleNewSearch}
              isLiked={(id) => likedDiagrams.has(id.toString())}
              onLike={handleLikeDiagram}
              onSearch={handleSearch}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
