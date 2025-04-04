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
import { Search, ArrowUp, Loader2, MessageSquare, X, Settings, Heart, User, TrendingUp, Sparkles, Info, Send, ArrowRight, ArrowLeft, ArrowDown } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const [suggestionScrollPosition, setSuggestionScrollPosition] = useState(0);
  const [typingSuggestions, setTypingSuggestions] = useState<string[]>([]);
  const [showTypingSuggestions, setShowTypingSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
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
    
    // Add user name if available - prioritize profile username
    if (profile?.username) {
      greeting += `, ${profile.username}`;
    } else if (user?.user_metadata?.name) {
      greeting += `, ${user.user_metadata.name}`;
    } else if (user?.email) {
      // Use the part before @ in email
      const name = user.email.split('@')[0];
      greeting += `, ${name}`;
    }
    
    return greeting;
  }, [user, profile]);
  
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
  
  // Update greeting when profile changes
  useEffect(() => {
    setUserGreeting(getGreeting());
  }, [profile, getGreeting]);
  
  // Simple empty function as placeholder since we're not using intersection observer
  const lastDiagramRef = useCallback(() => {
    // Intentionally empty - we're not using infinite scroll anymore
    // Only using the Load More button
  }, []);
  
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
          setTimeout(() => setShowConfetti(false), 3000);
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

  // Add effect to check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Rotating descriptions
  const descriptions = [
    "Visualize complex academic concepts",
    "Access high-quality educational resources",
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

  // Simplified scrolling suggestions with only the requested tags
  const scrollingSuggestions = [
    "human anatomy diagrams",
    "molecular structure visualization", 
    "physics force diagrams", 
    "data structures and algorithms",
    "circuit design diagrams",
    "neural network architecture",
    "plant cell structure",
    "solar system model"
  ];

  // Add effect for scrolling animation with slower speed for more fluid motion
  useEffect(() => {
    if (!searchTerm) {
      const scrollInterval = setInterval(() => {
        setSuggestionScrollPosition((prev) => prev + 0.15);
      }, 40);
      
      return () => clearInterval(scrollInterval);
    }
  }, [searchTerm]);

  // Generate typing suggestions based on input
  useEffect(() => {
    if (query.trim().length > 1) {
      // Filter suggestions that include the current query
      const matchedSuggestions = [
        ...scrollingSuggestions,
        "Medical diagrams", 
        "Computer networks",
        "Database schemas",
        "Machine learning models",
        "Ecosystem diagrams",
        "System architecture",
        "Design patterns",
        "Web technologies",
        "Cloud infrastructure"
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      setTypingSuggestions(matchedSuggestions);
      setShowTypingSuggestions(matchedSuggestions.length > 0);
    } else {
      setShowTypingSuggestions(false);
    }
  }, [query, scrollingSuggestions]);

  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden bg-transparent">
      {/* Enhanced animated background gradients for premium feel */}
      <div className="fixed inset-0 bg-gradient-to-br from-background/80 via-background to-blue-950/10 z-[-2]" />
      
      <motion.div
        className="fixed right-0 top-0 w-full h-full bg-blue-500/5 blur-[120px] z-[-1]"
        animate={{
          borderRadius: [
            '70% 30% 70% 30% / 30% 30% 70% 70%',
            '60% 40% 60% 40% / 40% 30% 70% 60%',
            '70% 30% 70% 30% / 30% 30% 70% 70%'
          ],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="fixed left-0 bottom-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] z-[-1]"
        animate={{
          borderRadius: [
            '30% 70% 30% 70% / 70% 30% 70% 30%',
            '40% 60% 40% 60% / 60% 40% 60% 40%',
            '30% 70% 30% 70% / 70% 30% 70% 30%'
          ],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Additional subtle gradient blob for premium feel */}
      <motion.div
        className="fixed left-1/4 top-1/3 w-1/3 h-1/3 bg-primary/3 blur-[150px] z-[-1]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <Header />
      
      <main className="flex-1">
        {!searchTerm && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] container max-w-2xl mx-auto px-4 md:px-6 py-4">
            <div className="text-center mb-16">
              <motion.h1 
                className="text-[28px] md:text-[32px] font-normal mb-2 tracking-tight text-foreground"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {userGreeting}
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
              className="w-full max-w-2xl mx-auto mb-12 relative"
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
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      // Immediately show suggestions if at least 2 characters typed
                      if (e.target.value.trim().length > 1) {
                        setShowTypingSuggestions(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(query);
                        setShowTypingSuggestions(false);
                      }
                    }}
                    className="w-full pl-14 pr-28 py-7 text-base md:text-lg rounded-[22px] border-0 shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <Search className="text-primary/80 h-5 w-5" />
                  </div>
                  
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setShowTypingSuggestions(false);
                      }}
                      className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-full"
                    >
                      <X className="h-4 w-4 text-muted-foreground/70" />
                    </button>
                  )}
                  
                  <Button
                    onClick={() => {
                      handleSearch(query);
                      setShowTypingSuggestions(false);
                    }}
                    disabled={!query.trim() || isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-2.5 bg-primary/90 hover:bg-primary dark:bg-primary/90 dark:hover:bg-primary shadow-sm"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                      <span className="font-normal">Search</span>
                    )}
                  </Button>
                </div>
                
                {/* Enhanced Typing suggestions */}
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
                              {query && suggestion.toLowerCase().includes(query.toLowerCase()) ? (
                                <>
                                  {suggestion.substring(0, suggestion.toLowerCase().indexOf(query.toLowerCase()))}
                                  <span className="font-medium text-primary/80">
                                    {query}
                                  </span>
                                  {suggestion.substring(suggestion.toLowerCase().indexOf(query.toLowerCase()) + query.length)}
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
                    {remainingSearches !== undefined ? 
                      `${remainingSearches} searches remaining today` : 
                      "Unlimited searches"}
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
            
            {/* Example/recent searches */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Single row of scrolling suggestions */}
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
                      transition: "transform 30s linear infinite"
                    }}
                  >
                    {[...scrollingSuggestions, ...scrollingSuggestions, ...scrollingSuggestions].map((suggestion, index) => (
                      <motion.div
                        key={`${suggestion}-${index}`}
                        whileHover={{ 
                          scale: 1.08,
                          rotate: [0, 1, 0, -1, 0],
                          transition: { rotate: { repeat: 0, duration: 0.3 } }
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="origin-center"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-sm py-2 px-4 h-auto border-primary/20 hover:border-primary/60 hover:bg-primary/5 whitespace-nowrap dark:border-gray-600 dark:bg-gray-800/60 dark:hover:bg-gray-800"
                          onClick={() => handleSearch(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
        
        {searchTerm && (
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Back button */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1 border-border/40 dark:border-gray-700/60"
                onClick={handleNewSearch}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>New Search</span>
              </Button>
              
              {/* Current search term with highlight */}
              <div className="text-lg sm:text-xl font-medium flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Results for</span>
                <span className="text-foreground">{searchTerm}</span>
              </div>

              {/* Tag filter */}
              {selectedTagFilter && (
                <Badge
                  variant="outline"
                  className="ml-2 rounded-full pl-2 pr-1 py-1 border-primary/30 bg-primary/5 hover:bg-primary/10 flex items-center gap-1 text-xs"
                >
                  <span>{selectedTagFilter}</span>
                  <button
                    className="rounded-full w-4 h-4 flex items-center justify-center"
                    onClick={() => setSelectedTagFilter(null)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {/* Remaining searches badge */}
              {remainingSearches !== undefined && remainingSearches < 10 && (
                <Badge variant="outline" className="bg-background/50 dark:bg-gray-900/50 text-xs ml-auto">
                  {remainingSearches} searches left today
                </Badge>
              )}
            </div>
            
            <ResultsSection 
              results={results}
              isLoading={isLoading}
              searchTerm={searchTerm}
              lastDiagramRef={lastDiagramRef}
              onLike={handleLikeDiagram}
              likedDiagrams={likedDiagrams}
              selectedTagFilter={selectedTagFilter}
              onTagFilterSelect={setSelectedTagFilter}
              hasMore={hasMore}
              loadMore={loadMore}
              error={error}
            />
            
            {/* Load more button */}
            {results.length > 0 && hasMore && !isLoading && (
              <div className="flex justify-center mt-8 mb-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
                  onClick={loadMore}
                >
                  Load more results
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
      {showConfetti && (
        <ConfettiCelebration 
          duration={3000} 
          particleCount={150} 
          onComplete={() => setShowConfetti(false)} 
        />
      )}
      
      <Dialog open={showTips} onOpenChange={setShowTips}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tips for better results</DialogTitle>
            <DialogDescription>
              Here are some tips to get better diagram search results
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 px-1 py-2">
              <div className="space-y-2">
                <h3 className="font-medium">Be specific</h3>
                <p className="text-sm text-muted-foreground">
                  Instead of "biology diagrams", try "human respiratory system diagram"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Include the type</h3>
                <p className="text-sm text-muted-foreground">
                  Specify the type like "flowchart", "ER diagram", "concept map"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Use field terminology</h3>
                <p className="text-sm text-muted-foreground">
                  Include field-specific terms like "UML class diagram for e-commerce"
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Mobile search input fixed to bottom */}
      {isMobile && !searchTerm && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/40 dark:border-gray-800/40 z-10"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        >
          <div className="relative">
            <div className="flex items-center relative overflow-hidden rounded-[22px] shadow-md border border-border/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700/50 bg-background/90 dark:bg-[#1d1e20]/90 backdrop-blur-sm">
              <Input
                type="text"
                placeholder="What diagrams are you looking for?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim().length > 1) {
                    setShowTypingSuggestions(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query);
                    setShowTypingSuggestions(false);
                  }
                }}
                className="w-full pl-14 pr-28 py-6 text-base rounded-[22px] border-0 shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <Search className="text-primary/80 h-5 w-5" />
              </div>
              
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setShowTypingSuggestions(false);
                  }}
                  className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-full"
                >
                  <X className="h-4 w-4 text-muted-foreground/70" />
                </button>
              )}
              
              <Button
                onClick={() => {
                  handleSearch(query);
                  setShowTypingSuggestions(false);
                }}
                disabled={!query.trim() || isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-2.5 bg-primary/90 hover:bg-primary dark:bg-primary/90 dark:hover:bg-primary shadow-sm"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <span className="font-normal">Search</span>
                )}
              </Button>
            </div>
            
            {/* Typing suggestions for mobile */}
            {showTypingSuggestions && (
              <motion.div 
                className="absolute left-0 right-0 bottom-full mb-2 bg-background/95 dark:bg-[#1d1e20]/95 backdrop-blur-sm rounded-xl shadow-sm border border-border/30 dark:border-gray-700/50 py-2 z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
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
                          {query && suggestion.toLowerCase().includes(query.toLowerCase()) ? (
                            <>
                              {suggestion.substring(0, suggestion.toLowerCase().indexOf(query.toLowerCase()))}
                              <span className="font-medium text-primary/80">
                                {query}
                              </span>
                              {suggestion.substring(suggestion.toLowerCase().indexOf(query.toLowerCase()) + query.length)}
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
        </motion.div>
      )}
    </div>
  );
}
