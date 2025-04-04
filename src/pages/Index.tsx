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

const Index = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [showSearchField, setShowSearchField] = useState(true);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const [suggestionScrollPosition, setSuggestionScrollPosition] = useState(0);
  const [typingSuggestions, setTypingSuggestions] = useState<string[]>([]);
  const [showTypingSuggestions, setShowTypingSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    incrementCount, 
    hasReachedLimit, 
    requiresLogin, 
    remainingSearches,
    loadCounts
  } = useSearchLimit();
  
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
      setIsMobile(window.innerWidth < 768);
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
          `${searchQuery} flow chart`,
          `${searchQuery} mind map`,
          `${searchQuery} UML diagram`
        );
      }
      
      // Combine and deduplicate suggestions, prioritizing exact matches
      const allSuggestions = [
        ...matchedExactSuggestions,
        ...matchedContextualSuggestions,
        ...nlpSuggestions
      ];
      
      // Remove duplicates and limit results
      const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 6);
      
      setTypingSuggestions(uniqueSuggestions);
      setShowTypingSuggestions(uniqueSuggestions.length > 0);
    } else {
      setShowTypingSuggestions(false);
    }
    
    // Force focus on the input field when typing
    if (searchQuery.trim().length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchQuery, scrollingSuggestions]);

  // Ensure suggestions appear when focusing on the input
  const handleInputFocus = () => {
    if (searchQuery.trim().length > 1) {
      setShowTypingSuggestions(typingSuggestions.length > 0);
    }
  };
  
  // Delay hiding suggestions on blur to allow clicking
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowTypingSuggestions(false);
    }, 200);
  };

  // Add an effect to reload search counts when the component mounts
  useEffect(() => {
    // Reload search count data
    loadCounts();
  }, [loadCounts]);

  const handleSearch = async (prompt: string) => {
    if (hasReachedLimit) {
      if (requiresLogin) {
        toast.info("Sign in to get more searches (20 free searches daily)", {
          description: "Create a free account to continue searching",
          action: {
            label: "Sign In",
            onClick: () => {
              if (onLoginClick) {
                onLoginClick();
              } else {
                navigate("/auth");
              }
            }
          }
        });
        return;
      } else {
        toast.info("You've reached your daily search limit!", {
          description: "Upgrade to Pro for 50+ searches per day",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing")
          }
        });
        return;
      }
    }
    
    const success = await incrementCount();
    if (!success) return;
    
    // Reload counts after incrementing to ensure UI is updated
    loadCounts();
    
    // Clear session storage for search results
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('diagramr-search-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    setShowSearchField(false);
    setSelectedTagFilter(null);
    setSearchQuery("");
    
    try {
      console.log(`Starting search for query: "${prompt}"`);
      await searchFor(prompt);
      setSearchAttempts(0);
      
      // Save to search history
      const savedHistory = localStorage.getItem('diagramr-search-history');
      let history: string[] = [];
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Error parsing search history:', e);
        }
      }
      
      const newHistory = [prompt, ...history.filter(item => item !== prompt)].slice(0, 10);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      if (remainingSearches <= 5 && remainingSearches > 0) {
        toast.info(`${remainingSearches} searches remaining today`, {
          description: user ? "Upgrade to Pro for more searches" : "Sign in for 20 searches/day",
          action: {
            label: user ? "Upgrade" : "Sign In",
            onClick: () => {
              if (user) {
                navigate("/pricing");
              } else if (onLoginClick) {
                onLoginClick();
              } else {
                navigate("/auth");
              }
            }
          }
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      
      setSearchAttempts(prev => prev + 1);
      
      if (error.message === 'API quota exceeded') {
        toast.error("API quota issue. Trying with alternate sources...", {
          duration: 3000
        });
      } else {
        if (searchAttempts >= 1) {
          const simplifiedQuery = prompt.split(' ').slice(0, 3).join(' ');
          toast.error("Search failed", {
            description: "Try a simplified search term or try again later.",
            action: {
              label: `Try "${simplifiedQuery}"`,
              onClick: () => handleSearch(simplifiedQuery)
            },
            duration: 8000
          });
        } else {
          toast.error("Search failed", {
            description: "There was an error with your search. Please try again or modify your search terms.",
            duration: 5000
          });
        }
      }
      
      setShowSearchField(true);
    }
  };

  const handleNewSearch = () => {
    setShowSearchField(true);
    resetSearch();
    setSearchAttempts(0);
    setSelectedTagFilter(null);
  };

  const handleLikeDiagram = async (diagramId: string | number) => {
    if (!user) {
      toast.info("Please sign in to save diagrams", {
        description: "Create a free account to save your favorite diagrams",
        action: {
          label: "Sign In",
          onClick: () => {
            if (onLoginClick) {
              onLoginClick();
            } else {
              navigate("/auth", { state: { returnTo: "/" } });
            }
          }
        }
      });
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

  const fetchLikedDiagrams = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchLikedDiagrams();
    
    // Focus search input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  }, [fetchLikedDiagrams]);

  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden bg-transparent">
      {/* Background gradient effect similar to dreamflow */}
      <div className="fixed inset-0 bg-gradient-to-br from-background/80 via-background to-blue-950/10 z-[-2]" />
      <div className="fixed right-0 top-0 w-full h-full bg-blue-500/5 blur-[120px] z-[-1]" style={{ borderRadius: '70% 30% 70% 30% / 30% 30% 70% 70%' }} />
      <div className="fixed left-0 bottom-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] z-[-1]" style={{ borderRadius: '30% 70% 30% 70% / 70% 30% 70% 30%' }} />
      
      <Header />
      <main className="flex-1">
        {!searchTerm ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] container max-w-2xl mx-auto px-4 md:px-6 py-4">
            <div className="text-center mb-16">
            <motion.h1 
                className="text-[28px] md:text-[32px] font-normal mb-2 tracking-tight text-foreground"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
                Find diagrams at the speed of thought.
            </motion.h1>
            
            {/* Animated rotating descriptions */}
            <motion.div
                className="h-6 overflow-hidden relative"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDescriptionIndex}
                    className="text-lg md:text-xl text-muted-foreground/70 font-normal"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {descriptions[currentDescriptionIndex]}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            </div>
            
            <motion.div 
              className="w-full max-w-2xl mx-auto mb-12 relative hidden md:block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative z-10">
                {/* Subtle glow effect behind input */}
                <div className="absolute -inset-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-[28px] blur-xl opacity-70"></div>
                
                <div className="flex items-center relative overflow-hidden rounded-[22px] shadow-md border border-border/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700/50 bg-background/90 dark:bg-[#1d1e20]/90 backdrop-blur-sm">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="What diagrams are you looking for?"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      // Immediately show suggestions if at least 2 characters typed
                      if (e.target.value.trim().length > 1) {
                        setShowTypingSuggestions(true);
                      }
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                        setShowTypingSuggestions(false);
                      }
                    }}
                    className="w-full pl-14 pr-28 py-7 text-base md:text-lg rounded-[22px] border-0 shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <Search className="text-primary/80 h-5 w-5" />
                  </div>
                  
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowTypingSuggestions(false);
                      }}
                      className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-full"
                    >
                      <X className="h-4 w-4 text-muted-foreground/70" />
                    </button>
                  )}
                  
                  <Button
                    onClick={() => {
                      handleSearch(searchQuery);
                      setShowTypingSuggestions(false);
                    }}
                    disabled={!searchQuery.trim() || isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-2.5 bg-primary/90 hover:bg-primary dark:bg-primary/90 dark:hover:bg-primary shadow-sm"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                      <span className="font-normal">Search</span>
                    )}
                  </Button>
                </div>
                
                {/* Enhanced Typing suggestions with NLP-like behavior */}
                {showTypingSuggestions && (
                  <motion.div 
                    className="absolute left-0 right-0 top-full mt-2 bg-background/95 dark:bg-[#1d1e20]/95 backdrop-blur-sm rounded-xl shadow-sm border border-border/30 dark:border-gray-700/50 py-2 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ul className="max-h-64 overflow-auto">
                      {typingSuggestions.map((suggestion, index) => (
                        <motion.li 
                          key={suggestion} 
                          className="px-4 py-2 hover:bg-muted/50 dark:hover:bg-gray-800/50 cursor-pointer"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { delay: index * 0.05 }
                          }}
                          onClick={() => {
                            handleSearch(suggestion);
                            setShowTypingSuggestions(false);
                          }}
                        >
                          <div className="flex items-center">
                            <Search className="h-3 w-3 mr-2 text-muted-foreground/70" />
                            <span className="font-normal">
                              {searchQuery && suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                                <>
                                  {suggestion.substring(0, suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                                  <span className="font-medium text-primary/80">
                                    {searchQuery}
                                  </span>
                                  {suggestion.substring(suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                                </>
                              ) : (
                                suggestion
                              )}
                            </span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground/70 mt-3 px-2">
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>
                    {user ? (
                      remainingSearches !== undefined ? 
                      `${remainingSearches} searches remaining today` : 
                      "Unlimited searches"
                    ) : (
                      remainingSearches !== undefined ?
                      `${remainingSearches}/3 guest searches left` :
                      "3/3 guest searches left"
                    )}
                  </span>
                </div>
                
                <button 
                  onClick={() => setShowTips(true)}
                  className="flex items-center hover:text-primary/80 transition-colors"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Search tips</span>
                </button>
              </div>
            </motion.div>
            
            {/* Mobile search button - REMOVED */}
            
            {/* Infinite scrolling suggestions - Styled like Grok's suggestion chips */}
            <div className="w-full max-w-xl mx-auto">
              <motion.div 
                className="flex overflow-hidden py-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div 
                  className="flex gap-3"
                  style={{
                    width: "300%",
                    transform: `translateX(-${suggestionScrollPosition % 66.6}%)`,
                    transition: "transform 2.5s ease-out"
                  }}
                >
                  {[...scrollingSuggestions, ...scrollingSuggestions, ...scrollingSuggestions].map((suggestion, index) => (
                    <motion.div
                      key={`${suggestion}-${index}`}
                      whileHover={{ 
                        scale: 1.03,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="origin-center"
                    >
                      <button
                        className="flex items-center px-4 py-2 rounded-full text-sm font-normal text-foreground/90 border border-border/25 bg-background/50 hover:bg-background/90 hover:border-border/40 whitespace-nowrap dark:border-gray-700/40 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
                        onClick={() => handleSearch(suggestion)}
                      >
                        {suggestion}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="container max-w-6xl mx-auto px-2 md:px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2.5">
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-medium leading-tight">
                  Results for "{searchTerm}"
                </h2>
                <p className="text-sm text-muted-foreground/70 mt-0.5">
                  Showing {Math.min(results.length, 15)} of {results.length > 20 ? `${results.length}+ diagrams` : `${results.length} diagrams`}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 h-8 whitespace-nowrap self-start sm:self-center mt-1 sm:mt-0"
                onClick={handleNewSearch}
              >
                <Search className="h-3.5 w-3.5" />
                <span>New Search</span>
              </Button>
            </div>
            
            <ResultsSection 
              results={results}
              isLoading={isLoading}
              error={error}
              likedDiagrams={likedDiagrams}
              onLike={handleLikeDiagram}
              selectedTagFilter={selectedTagFilter}
              onSelectTagFilter={setSelectedTagFilter}
              lastDiagramRef={lastResultRef}
              searchTerm={searchTerm}
              onNewSearch={handleNewSearch}
              onSearch={handleSearch}
              hasMore={hasMore}
              loadMore={loadMore}
            />
          </div>
        )}
      </main>
      
      {/* Mobile search input fixed to bottom */}
      {isMobile && !searchTerm && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#f9f8f6]/95 dark:bg-[#1d1e20]/95 backdrop-blur-lg border-t border-border/30 dark:border-gray-800 p-4 pb-10 z-50 safe-bottom">
          <div className="relative z-10">
            {/* Subtle glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-full blur-xl opacity-70"></div>
            
            <div className="relative overflow-hidden rounded-full shadow-md border border-border/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700/50 bg-background/90 dark:bg-[#1d1e20]/90 backdrop-blur-sm">
            <Input
              ref={inputRef}
              type="text"
                placeholder="What do you want to know?"
              value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Immediately show suggestions if at least 2 characters typed
                  if (e.target.value.trim().length > 1) {
                    setShowTypingSuggestions(true);
                  }
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                  setShowTypingSuggestions(false);
                }
              }}
                className="pr-16 pl-6 py-9 border-0 text-base shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
            />
            <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full p-0 bg-[#10A37F] hover:bg-[#10A37F]/90 dark:bg-[#10A37F] dark:hover:bg-[#10A37F]/90 shadow-sm flex items-center justify-center"
              onClick={() => {
                handleSearch(searchQuery);
                setShowTypingSuggestions(false);
              }}
              disabled={!searchQuery.trim()}
            >
                {/* More minimal icon that matches Claude's theme */}
                <svg 
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M5 12h14M12 5l7 7-7 7" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
            </Button>
            
              {/* Mobile typing suggestions with NLP-like behavior - showing upwards */}
              {showTypingSuggestions && (
              <motion.div 
                  className="absolute left-0 right-0 bottom-full mb-2 bg-background/95 dark:bg-[#1d1e20]/95 backdrop-blur-sm rounded-xl shadow-md border border-border/30 dark:border-gray-700/50 py-2 z-20 max-h-[50vh] overflow-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                  <ul>
                  {typingSuggestions.map((suggestion, index) => (
                    <motion.li 
                      key={suggestion} 
                        className="px-4 py-3 hover:bg-muted/50 dark:hover:bg-gray-800/50 cursor-pointer"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: index * 0.05 }
                      }}
                      onClick={() => {
                        handleSearch(suggestion);
                        setShowTypingSuggestions(false);
                      }}
                    >
                      <div className="flex items-center">
                          <Search className="h-3 w-3 mr-2 text-muted-foreground/70" />
                          <span className="text-sm font-normal">
                            {searchQuery && suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                              <>
                                {suggestion.substring(0, suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                                <span className="font-medium text-primary/80">
                                  {searchQuery}
                                </span>
                                {suggestion.substring(suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                              </>
                            ) : (
                              suggestion
                            )}
                          </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
            </div>
            
            {/* Mobile search counter */}
            <div className="flex justify-between items-center text-xs text-muted-foreground/70 mt-2 px-2">
              <div className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span>
                  {user ? (
                    remainingSearches !== undefined ? 
                    `${remainingSearches} searches remaining today` : 
                    "Unlimited searches"
                  ) : (
                    remainingSearches !== undefined ?
                    `${remainingSearches}/3 guest searches left` :
                    "3/3 guest searches left"
                  )}
                </span>
              </div>
              
              <button 
                onClick={() => setShowTips(true)}
                className="flex items-center hover:text-primary/80 transition-colors"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Search tips</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Dialog open={showTips} onOpenChange={setShowTips}>
        <DialogContent className="sm:max-w-md bg-background/95 dark:bg-gray-900/95 backdrop-blur-sm border-border/30 dark:border-gray-800/50 shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-normal">Tips for better results</DialogTitle>
            <DialogDescription className="text-muted-foreground/70">
              Here are some tips to get better diagram search results
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 px-1 py-2">
              <div className="space-y-1.5">
                <h3 className="font-normal text-base">Be specific</h3>
                <p className="text-sm text-muted-foreground/70">
                  Instead of "biology diagrams", try "human respiratory system diagram"
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-normal text-base">Include the type</h3>
                <p className="text-sm text-muted-foreground/70">
                  Specify the type like "flowchart", "ER diagram", "concept map"
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-normal text-base">Use field terminology</h3>
                <p className="text-sm text-muted-foreground/70">
                  Include field-specific terms like "UML class diagram for e-commerce"
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
