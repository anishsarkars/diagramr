import { useState, useEffect, useRef, useCallback } from "react";
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
import { EducationalDiagramsMarquee } from "@/components/educational-diagrams-marquee";
import { RecommendationsConnector } from "@/components/recommendations-connector";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  // Popular search suggestions
  const popularSearches = [
    "UML diagram",
    "Flowchart",
    "Entity-relationship diagram",
    "System architecture",
    "Network diagram",
    "Mind map",
    "Database schema",
    "Class diagram",
    "Sequence diagram"
  ];

  const suggestions = popularSearches.filter(search => 
    search.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  // Rotating descriptions
  const descriptions = [
    "Find diagrams at the speed of thought.",
    "Visualize complex concepts instantly.",
    "Discover perfect illustrations quickly.",
    "Enhance your projects with visuals.",
    "Access high-quality diagrams effortlessly."
  ];

  // Add description rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDescriptionIndex((prevIndex) => (prevIndex + 1) % descriptions.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [descriptions.length]);

  // Auto-scroll effect with slowed down speed
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 0.5; // Reduced speed
      }
    };

    // Increased interval timing for slower animation
    const scrollInterval = setInterval(scroll, 50);
    return () => clearInterval(scrollInterval);
  }, []);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Improve the NLP suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      // Find exact matches within scrolling suggestions
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
      
      // Complete the sentence suggestions with improved relevance
      if (searchQuery.toLowerCase().includes("diagram")) {
        nlpSuggestions = [
          `${searchQuery} for education`,
          `${searchQuery} with examples`,
          `${searchQuery} explained visually`,
          `interactive ${searchQuery}`
        ];
      } else if (searchQuery.toLowerCase().includes("chart") || searchQuery.toLowerCase().includes("graph")) {
        nlpSuggestions = [
          `${searchQuery} visualization`,
          `${searchQuery} examples`,
          `interactive ${searchQuery}`,
          `${searchQuery} template`
        ];
      } else if (searchQuery.length > 2) { // Reduced minimum length
        // Domain-specific completions with enhanced relevance
        const domains = ["biology", "chemistry", "physics", "computer science", "engineering", "math", "data", "business", "education", "medical"];
        const domainMatch = domains.find(domain => searchQuery.toLowerCase().includes(domain));
        
        if (domainMatch) {
          nlpSuggestions = [
            `${domainMatch} diagram ${searchQuery.replace(domainMatch, "").trim()}`,
            `${searchQuery} visual representation`,
            `${searchQuery} concept visualization`,
            `${searchQuery} learning materials`
          ];
        } else {
          // Improved generic completions for short queries
          nlpSuggestions = [
            `${searchQuery} diagram`,
            `${searchQuery} illustration`,
            `${searchQuery} visual guide`,
            `${searchQuery} concept map`
          ];
        }
      }
      
      // Add common diagram types for any short query with better targeting
      if (searchQuery.length > 1 && searchQuery.length < 20 && !searchQuery.toLowerCase().includes("diagram")) {
        // More specific diagram type suggestions based on query context
        if (searchQuery.toLowerCase().includes("process") || searchQuery.toLowerCase().includes("step")) {
        nlpSuggestions.push(
          `${searchQuery} flow chart`,
            `${searchQuery} process diagram`
          );
        } else if (searchQuery.toLowerCase().includes("concept") || searchQuery.toLowerCase().includes("idea")) {
          nlpSuggestions.push(
          `${searchQuery} mind map`,
            `${searchQuery} concept visualization`
          );
        } else if (searchQuery.toLowerCase().includes("code") || searchQuery.toLowerCase().includes("system") || searchQuery.toLowerCase().includes("software")) {
          nlpSuggestions.push(
            `${searchQuery} UML diagram`,
            `${searchQuery} architecture diagram`
          );
        } else {
          // Default suggestions for general queries
          nlpSuggestions.push(
            `${searchQuery} flow chart`,
            `${searchQuery} mind map`,
            `${searchQuery} diagram examples`
          );
        }
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

  // Handle submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden bg-transparent">
      {/* Background is now handled in the main CSS */}
      
      <Header />
      <main className="flex-1">
        {!searchTerm ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] container max-w-2xl mx-auto px-4 md:px-6 py-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mb-6 flex justify-center"
              >
                <a
                  href="https://www.producthunt.com/posts/diagramr?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-diagramr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-90 transition-opacity"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=950719&theme=light&t=1744154655943"
                    alt="Diagramr - Fastest way to find any diagram ✦ Google Images Sucks!"
                    width="180"
                    height="40"
                    style={{ width: '180px', height: '40px' }}
                  />
                </a>
              </motion.div>
              
              <motion.h1 
                className="text-[28px] md:text-[32px] font-normal mb-2 tracking-tight text-foreground"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Find diagrams at the speed of thought.
              </motion.h1>
              
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
            
            {/* Desktop search input with glowing effect */}
            <motion.div 
              className="w-full max-w-2xl mx-auto mb-12 relative hidden md:block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative z-10">
                {/* Subtle glow effect */}
                <div className="absolute -inset-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-[28px] blur-xl opacity-70"></div>
                
                <div className="flex items-center relative overflow-hidden rounded-[22px] shadow-md border border-border/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700/50 bg-background/90 dark:bg-[#1d1e20]/90 backdrop-blur-sm">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="What diagrams are you looking for?"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-14 pr-28 py-7 text-base md:text-lg rounded-[22px] border-0 shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
                  />
                  
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <Search className="text-primary h-6 w-6" />
                  </div>
                  
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1 hover:bg-primary/5 rounded-full"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!searchQuery.trim() || isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-3 h-12 bg-primary/90 hover:bg-primary dark:bg-primary dark:hover:bg-primary/90 shadow-md"
                  >
                    <span className="text-base">Search</span>
                  </Button>
                </div>
                
                {/* Search suggestions */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-background/90 backdrop-blur-md border border-border/20 rounded-xl shadow-sm overflow-hidden z-50"
                    >
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={suggestion} 
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "w-full px-3.5 py-2.5 text-left hover:bg-primary/5 flex items-center gap-2.5 transition-colors",
                            "text-sm leading-tight",
                            index !== suggestions.length - 1 && "border-b border-border/10"
                          )}
                          initial={{ opacity: 0, x: -3 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { delay: index * 0.03 }
                          }}
                        >
                          <div className="rounded-full bg-primary/10 p-1.5 flex items-center justify-center">
                            <Search className="h-3 w-3 text-primary/80" />
                          </div>
                          <span>
                            {searchQuery && suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                              <>
                                {suggestion.substring(0, suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                                <span className="font-medium text-primary">
                                  {searchQuery}
                                </span>
                                {suggestion.substring(suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                              </>
                            ) : (
                              suggestion
                            )}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 px-2">
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
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Search tips</span>
                </button>
              </div>
            </motion.div>
            
            {/* Mobile search button - removed as requested */}
            {/* 
            <motion.div
              className="md:hidden w-full max-w-xs mx-auto mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                onClick={() => onLoginClick ? onLoginClick() : navigate('/auth')}
                className="w-full py-6 text-base rounded-2xl"
              >
                <Search className="h-5 w-5 mr-2" />
                <span>Search Diagrams</span>
              </Button>
            </motion.div>
            */}
            
            {/* Animated scrolling suggestions */}
            <div className="w-full max-w-xl mx-auto">
              <motion.div
                className="flex overflow-hidden py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div 
                  className="flex gap-3"
                  style={{
                    width: '300%',
                    transform: `translateX(-${suggestionScrollPosition % 50}%)`,
                    transition: 'transform 1.5s ease-out'
                  }}
                >
                  {scrollingSuggestions.map((suggestion, index) => (
                    <motion.div 
                      key={`${suggestion}-${index}`}
                      className="origin-center"
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: [1, 1 + Math.random() * 0.01, 1], 
                        rotate: [0, Math.random() * 0.5 - 0.25, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Button
                        variant="outline"
                        className="rounded-full text-sm py-2 px-4 h-auto border-primary/20 hover:border-primary/60 hover:bg-primary/5 whitespace-nowrap dark:border-gray-600 dark:bg-gray-800/60 dark:hover:bg-gray-800"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    </motion.div>
                  ))}
                  {/* Duplicated for continuous scrolling effect */}
                  {scrollingSuggestions.map((suggestion, index) => (
                    <motion.div 
                      key={`${suggestion}-duplicate-${index}`}
                      className="origin-center"
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: [1, 1 + Math.random() * 0.01, 1], 
                        rotate: [0, Math.random() * 0.5 - 0.25, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Button
                        variant="outline"
                        className="rounded-full text-sm py-2 px-4 h-auto border-primary/20 hover:border-primary/60 hover:bg-primary/5 whitespace-nowrap dark:border-gray-600 dark:bg-gray-800/60 dark:hover:bg-gray-800"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    </motion.div>
                  ))}
                  {/* Triplicated for continuous scrolling effect */}
                  {scrollingSuggestions.map((suggestion, index) => (
                    <motion.div 
                      key={`${suggestion}-triplicate-${index}`}
                      className="origin-center"
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: [1, 1 + Math.random() * 0.01, 1], 
                        rotate: [0, Math.random() * 0.5 - 0.25, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Button
                        variant="outline"
                        className="rounded-full text-sm py-2 px-4 h-auto border-primary/20 hover:border-primary/60 hover:bg-primary/5 whitespace-nowrap dark:border-gray-600 dark:bg-gray-800/60 dark:hover:bg-gray-800"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="container max-w-6xl mx-auto px-2 md:px-4 py-6">
            <div className="flex flex-row items-center justify-between mb-5 border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-medium">
                  "{searchTerm}"
                </h2>
                <p className="text-sm text-muted-foreground/80 px-2 py-1 bg-muted/50 rounded-md whitespace-nowrap">
                  {Math.min(results.length, 15)} of {results.length > 20 ? `${results.length}+` : results.length}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 h-8"
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
            
            {/* Add Recommended Resources Section */}
            {searchTerm && !isLoading && results.length > 0 && (
              <RecommendationsConnector 
                searchQuery={searchTerm} 
                enabled={!isLoading && results.length > 0}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Mobile search input fixed to bottom */}
      {isMobile && !searchTerm && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/30 p-4 pb-10 z-50 safe-bottom">
          <div className="relative">
            {/* Subtle glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-full blur-xl opacity-70"></div>
            
            <div className="relative overflow-hidden rounded-full shadow-md border border-border/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 bg-background/90 backdrop-blur-sm">
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
                className="pr-16 pl-6 py-7 border-0 text-base shadow-none focus:ring-0 focus:outline-none bg-transparent"
            />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Button 
                  type="submit" 
                  onClick={() => handleSearch(searchQuery)}
                  className="rounded-xl px-4 py-5 bg-primary/90 hover:bg-primary text-white"
                >
                  <span className="mr-1">Search</span>
                  <ArrowRight className="h-4 w-4" />
            </Button>
              </div>
            </div>
            
            {/* Mobile typing suggestions */}
              {showTypingSuggestions && (
              <motion.div 
                className="absolute left-0 right-0 bottom-full mb-2 bg-background/90 backdrop-blur-md rounded-xl shadow-sm border border-border/20 py-1.5 z-20 max-h-[45vh] overflow-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col space-y-0.5">
                  {typingSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion} 
                      className="w-full px-3.5 py-2.5 text-left hover:bg-primary/5 flex items-center gap-2.5 transition-colors"
                      initial={{ opacity: 0, x: -3 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: index * 0.03 }
                      }}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch(suggestion);
                        setShowTypingSuggestions(false);
                      }}
                    >
                      <div className="rounded-full bg-primary/10 p-1.5 flex items-center justify-center">
                        <Search className="h-3 w-3 text-primary/80" />
                      </div>
                      <span className="text-sm leading-tight">
                        {searchQuery && suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                          <>
                            {suggestion.substring(0, suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                            <span className="font-medium text-primary">
                              {searchQuery}
                            </span>
                            {suggestion.substring(suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                          </>
                        ) : (
                          suggestion
                        )}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Mobile scrolling tag chips */}
            <div className="mt-4 overflow-x-auto pb-2 -mx-2 px-2">
              <div className="flex gap-2 min-w-max">
                {scrollingSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="flex-none whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch(suggestion);
                      setShowTypingSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
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
                className="flex items-center hover:text-primary/80 transition-colors p-2 -m-2"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Search tips</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Dialog open={showTips} onOpenChange={setShowTips}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border-border/30 shadow-sm">
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
      
      {/* Add the educational diagrams 3D marquee here - only shown on landing page */}
      {!searchTerm && <EducationalDiagramsMarquee />}
      
      <Footer />
    </div>
  );
};

export default Index;
