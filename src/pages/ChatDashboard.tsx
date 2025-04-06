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
import { Search, ArrowUp, Loader2, MessageSquare, X, Settings, Heart, User, TrendingUp, Sparkles, Info, Send, ArrowRight } from "lucide-react";
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
import { Footer } from "@/components/footer";
import { NameCollectionDialog } from "@/components/name-collection-dialog";
import { Compact3DMarquee } from "@/components/compact-3d-marquee";

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
  const [marqueeImages, setMarqueeImages] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut, isNewLogin, setIsNewLogin, profile } = useAuth();
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
    
    // Add user name if available - prioritize the profile username
    if (profile?.username && !profile.username.startsWith('user_')) {
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
  
  // Update greeting whenever profile changes
  useEffect(() => {
    setUserGreeting(getGreeting());
  }, [profile, getGreeting]);
  
  // Enhanced NLP-based search suggestions
  const generateSearchSuggestions = (query: string) => {
    if (query.trim().length < 2) return [];
    
    // Base suggestions for popular domains
    const baseSuggestions = [
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
    ];
    
    // Semantic expansions for common topics
    const semanticExpansions: Record<string, string[]> = {
      "anatomy": ["human anatomy", "brain structure", "skeletal system", "muscle anatomy", "nervous system"],
      "biology": ["cell structure", "dna replication", "protein synthesis", "ecosystem", "phylogenetic tree"],
      "chemistry": ["molecular structure", "periodic table", "reaction mechanisms", "organic compounds", "electron configuration"],
      "physics": ["force diagrams", "circuit diagrams", "wave patterns", "quantum models", "electromagnetic fields"],
      "math": ["geometric shapes", "function graphs", "statistical distributions", "number theory", "calculus concepts"],
      "computer": ["network topology", "data structures", "algorithm flowcharts", "system architecture", "database schema"],
      "business": ["process flow", "organizational chart", "marketing funnel", "supply chain", "business model canvas"],
      "system": ["system architecture", "component diagrams", "data flow", "state machines", "deployment diagrams"],
      "neural": ["neural network", "deep learning architecture", "convolutional networks", "recurrent networks", "transformer models"]
    };
    
    // Check for semantic matches
    const queryLower = query.toLowerCase();
    let semanticMatches: string[] = [];
    
    Object.keys(semanticExpansions).forEach(key => {
      if (queryLower.includes(key)) {
        semanticMatches = [...semanticMatches, ...semanticExpansions[key]];
      }
    });
    
    // Combine direct matches and semantic matches
    const directMatches = baseSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(queryLower)
    );
    
    // Add contextual suggestions based on query patterns
    let contextualSuggestions: string[] = [];
    
    // If query starts with "how" or "what", suggest explanatory diagrams
    if (queryLower.startsWith("how") || queryLower.startsWith("what")) {
      contextualSuggestions = [
        "process flow diagram",
        "conceptual model",
        "explanatory illustration",
        "step-by-step visual guide"
      ];
    }
    
    // If query contains education-related terms
    if (queryLower.includes("learn") || queryLower.includes("study") || queryLower.includes("education")) {
      contextualSuggestions.push(
        "educational diagram",
        "learning concept map",
        "study guide visualization",
        "teaching aid illustration"
      );
    }
    
    // Combine all suggestions and filter for relevance
    const allSuggestions = [...directMatches, ...semanticMatches, ...contextualSuggestions];
    
    // Remove duplicates and limit results
    return [...new Set(allSuggestions)]
      .slice(0, 5)
      .map(suggestion => queryLower.length > 6 && suggestion.length > 30 ? suggestion.substring(0, 30) + "..." : suggestion);
  };

  // Generate typing suggestions based on input
  useEffect(() => {
    if (query.trim().length > 1) {
      const smartSuggestions = generateSearchSuggestions(query);
      setTypingSuggestions(smartSuggestions);
      setShowTypingSuggestions(smartSuggestions.length > 0);
    } else {
      setShowTypingSuggestions(false);
    }
  }, [query]);

  // Fetch sample images for the marquee with better image selection
  useEffect(() => {
    const fetchSampleImages = async () => {
      try {
        // Curated high-quality diagram images for marquee display
        setMarqueeImages([
          // Anatomy and medicine
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1559757175-7b21671636f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          
          // Tech and computer science
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1542903660-eedba2cda473?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          
          // Science diagrams
          "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1628595351029-c2bf17511435?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          
          // Geography and maps
          "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1566288623394-377af472d81b?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          
          // Business and process flows
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          
          // Mathematics and formulas
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          
          // More computer science
          "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1488229297570-58520851e868?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700",
          "https://images.unsplash.com/photo-1581093196277-9f6e9b96cc00?ixlib=rb-4.0.3&auto=format&fit=crop&w=970&h=700"
        ]);
      } catch (err) {
        console.error('Error setting marquee images:', err);
        // Set fallback images if something goes wrong
        setMarqueeImages([
          'https://placehold.co/970x700/f8fafc/e2e8f0?text=Diagram+1',
          'https://placehold.co/970x700/f8fafc/e2e8f0?text=Diagram+2',
          'https://placehold.co/970x700/f8fafc/e2e8f0?text=Diagram+3',
        ]);
      }
    };
    
    fetchSampleImages();
  }, []);
  
  // Check for post-login celebration
  useEffect(() => {
    // Only attempt to show confetti if we have a user
    if (!user) return;
    
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const confettiKey = `diagramr-last-login`;
    const lastLogin = sessionStorage.getItem(confettiKey);
    const confettiShown = sessionStorage.getItem('confetti_shown');
    const currentTime = new Date().getTime();
    
    // Check localStorage for authentication events
    const lastAuthEvent = localStorage.getItem('last_login_time');
    const authEventTime = lastAuthEvent ? parseInt(lastAuthEvent) : 0;
    const isRecentAuth = (currentTime - authEventTime) < 10000; // Within last 10 seconds
    
    // Show confetti if:
    // 1. This is flagged as a new login from auth context
    // 2. There was a recent login but confetti hasn't been shown yet in this session
    // 3. This is the first view of dashboard in this session 
    const shouldShowConfetti = 
      isNewLogin || 
      (isRecentAuth && confettiShown !== 'true') ||
      (!lastLogin && user);
    
    if (shouldShowConfetti) {
      console.log("Dashboard detected login event - showing confetti celebration");
      
      // Set a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (isMounted) {
          setShowConfetti(true);
          
          // Mark confetti as shown in this session
          sessionStorage.setItem('confetti_shown', 'true');
          
          // Reset the new login flag
          if (isNewLogin) {
            setIsNewLogin(false);
          }
          
          // Mark this login time in session storage
          sessionStorage.setItem(confettiKey, currentTime.toString());
          
          // Show welcome toast with profile name if available
          toast.success(`Welcome ${profile?.username || 'back'}!`, {
            description: "Ready to discover amazing diagrams?",
            duration: 3000,
          });
        }
      }, 500); // Increased delay to ensure everything is initialized
      
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, isNewLogin, setIsNewLogin, profile]);

  // Clean up confetti state when component unmounts
  useEffect(() => {
    return () => {
      setShowConfetti(false);
    };
  }, []);
  
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
    
    // Clear input
    setQuery("");
    setShowTypingSuggestions(false);
    
    console.log(`Starting search for: "${searchQuery}"`);
    
    try {
      // Clear session storage for search results to ensure fresh results
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('diagramr-search-')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Start search
      await searchFor(searchQuery);
      
      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      // Show remaining searches toast if low
      if (remainingSearches <= 5 && remainingSearches > 0) {
        toast.info(`${remainingSearches} searches remaining today`, {
          description: "Upgrade to Pro for more searches",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing")
          }
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
      
      // Offer a simplified search if the search fails
      if (searchQuery.split(' ').length > 2) {
        const simplifiedQuery = searchQuery.split(' ').slice(0, 2).join(' ');
        toast.error("Search failed", {
          description: "Try a simplified search term",
          action: {
            label: `Try "${simplifiedQuery}"`,
            onClick: () => handleSearch(simplifiedQuery)
          },
          duration: 8000
        });
      }
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
          
          // Small confetti celebration when adding to favorites
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
    "How can I help you today?",
    "Find the perfect diagrams for your needs",
    "Discover visual learning resources",
    "Search for educational diagrams",
    "What would you like to learn about?"
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
    "neural network architecture"
  ];

  // Add effect for scrolling animation with slower speed for more fluid motion
  useEffect(() => {
    if (!searchTerm) {
      let scrollInterval = setInterval(() => {
        setSuggestionScrollPosition((prev) => prev + 0.1); // Slower scrolling speed for smoother appearance
      }, 50); // Adjusted interval for more consistent animation
      
      // Pause animation on hover
      const suggestionContainer = document.querySelector('.suggestion-container');
      if (suggestionContainer) {
        const pauseAnimation = () => {
          clearInterval(scrollInterval);
        };
        
        const resumeAnimation = () => {
          // This will restart the animation when mouse leaves
          scrollInterval = setInterval(() => {
            setSuggestionScrollPosition((prev) => prev + 0.1);
          }, 50);
        };
        
        suggestionContainer.addEventListener('mouseenter', pauseAnimation);
        suggestionContainer.addEventListener('mouseleave', resumeAnimation);
        
        return () => {
          clearInterval(scrollInterval);
          suggestionContainer.removeEventListener('mouseenter', pauseAnimation);
          suggestionContainer.removeEventListener('mouseleave', resumeAnimation);
        };
      }
      
      return () => clearInterval(scrollInterval);
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden bg-transparent flex flex-col">
      <Header />
      
      {/* Name collection dialog for new users */}
      <NameCollectionDialog />
      
      <main className="flex-1">
        {!searchTerm && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] container max-w-2xl mx-auto px-4 md:px-6 py-4">
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
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                            handleSearch(query);
                        setShowTypingSuggestions(false);
                      }
                    }}
                    className="w-full pl-14 pr-28 py-7 text-base md:text-lg rounded-[22px] border-0 shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <Search className="text-primary h-6 w-6" />
                  </div>
                  
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setShowTypingSuggestions(false);
                      }}
                      className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-muted rounded-full"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                  
                  <Button
                    onClick={() => {
                      handleSearch(query);
                      setShowTypingSuggestions(false);
                    }}
                    disabled={!query.trim() || isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-3 h-12 bg-primary/90 hover:bg-primary dark:bg-primary dark:hover:bg-primary/90 shadow-md"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                      <span className="text-base">Search</span>
                    )}
                  </Button>
                </div>
                
                {/* Typing suggestions */}
                {showTypingSuggestions && (
                  <motion.div 
                    className="absolute left-0 right-0 top-full mt-2 bg-background dark:bg-[#1d1e20] rounded-xl shadow-lg border border-border/50 dark:border-gray-700 py-2 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ul className="max-h-64 overflow-auto">
                      {typingSuggestions.map((suggestion, index) => (
                        <motion.li 
                          key={suggestion} 
                          className="px-4 py-2 hover:bg-muted dark:hover:bg-gray-800 cursor-pointer"
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
                            <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span>{suggestion}</span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
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
                      "Sign in for more searches"
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
            
            {/* Single row of scrolling suggestions */}
            <div className="w-full max-w-xl mx-auto">
              <motion.div 
                className="flex overflow-hidden py-2 suggestion-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div 
                  className="flex gap-3"
                  style={{
                    width: "300%",
                    transform: `translateX(-${suggestionScrollPosition % 66.6}%)`,
                    transition: "transform 1.5s ease-out"
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
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSearch(suggestion)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSearch(suggestion);
                        }
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-sm py-2 px-4 h-auto border-primary/20 hover:border-primary/60 hover:bg-primary/5 whitespace-nowrap dark:border-gray-600 dark:bg-gray-800/60 dark:hover:bg-gray-800 pointer-events-none"
                      >
                        {suggestion}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Recent searches - now with improved styling */}
                {searchHistory.length > 0 && (
                  <motion.div
                className="w-full max-w-xl mx-auto mt-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-xs text-muted-foreground">Recent searches</span>
                  <div className="h-px flex-1 bg-border"></div>
                    </div>
                    
                <div className="flex flex-wrap justify-center gap-2">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                        transition: { delay: 0.5 + (index * 0.05) }
                      }}
                      whileHover={{ 
                        y: -3,
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        transition: { duration: 0.2 }
                      }}
                        >
                          <Button
                        variant="ghost"
                            size="sm"
                        className="rounded-full text-xs h-7"
                            onClick={() => handleSearch(item)}
                          >
                            {item}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
            )}
          </div>
        )}
        
        {/* Results section */}
        {searchTerm && (
          <div className="pt-4 container max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-row items-center justify-between mb-5 border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-medium">"{searchTerm}"</h2>
                <p className="text-sm text-muted-foreground/80 px-2 py-1 bg-muted/50 rounded-md whitespace-nowrap">
                  {results.length} of {Math.max(20, results.length)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNewSearch} 
                className="flex items-center gap-1.5 h-8"
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
              onTagFilterSelect={setSelectedTagFilter}
              lastDiagramRef={lastDiagramRef}
              searchTerm={searchTerm}
              onNewSearch={handleNewSearch}
            />
          </div>
        )}
        
        {/* Compact 3D Marquee at the bottom, now better centered and larger */}
        {!searchTerm && (
          <div className="relative w-full overflow-hidden h-64 mt-auto">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 right-0 h-28 bottom-0 bg-gradient-to-t from-background to-transparent z-10"></div>
              <div className="absolute left-0 right-0 h-20 top-0 bg-gradient-to-b from-background to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-radial from-primary/[0.03] via-transparent to-transparent opacity-30 mix-blend-overlay"></div>
        </div>
            <div className="flex justify-center items-center h-full relative">
              <div className="absolute w-full h-full max-w-6xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-20 z-5"></div>
              </div>
              <Compact3DMarquee 
                images={marqueeImages} 
                rows={3} 
                className="h-64 opacity-85 hover:opacity-100 transition-opacity duration-700 w-full max-w-6xl mx-auto"
              />
            </div>
          </div>
        )}
      </main>
        
      {/* Mobile search input fixed to bottom */}
      {isMobile && !searchTerm && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#f9f8f6]/95 dark:bg-[#1d1e20]/95 backdrop-blur-lg border-t border-border/30 dark:border-gray-800 p-3 pb-5 z-50 safe-bottom">
          <div className="relative z-10">
            {/* Subtle glow effect behind input */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-full blur-xl opacity-70"></div>
            
            <div className="relative overflow-hidden rounded-[18px] shadow-md border border-border/40 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 dark:border-gray-700/50 bg-background/90 dark:bg-[#1d1e20]/90 backdrop-blur-sm">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="What diagrams are you looking for?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(query);
                      setShowTypingSuggestions(false);
                    }
                  }}
                  className="pr-20 pl-12 py-6 border-0 text-base shadow-none focus:ring-0 focus:outline-none dark:bg-transparent"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-5 bg-primary/90 hover:bg-primary dark:bg-primary dark:hover:bg-primary/90 shadow"
                  onClick={() => {
                    handleSearch(query);
                    setShowTypingSuggestions(false);
                  }}
                  disabled={!query.trim()}
                >
                  <span className="text-sm">Search</span>
                </Button>
            
            {/* Mobile typing suggestions */}
            {showTypingSuggestions && isMobile && (
              <motion.div 
                className="absolute left-0 right-0 bottom-full mb-2 bg-background/95 dark:bg-[#1d1e20]/95 rounded-xl shadow-lg border border-border/50 dark:border-gray-700 py-2 z-20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <ul className="max-h-64 overflow-auto">
                  {typingSuggestions.map((suggestion, index) => (
                    <motion.li 
                      key={suggestion} 
                      className="px-4 py-2 hover:bg-muted dark:hover:bg-gray-800 cursor-pointer"
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
                        <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
            </div>
          </div>
        </div>
      )}
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1000]">
        <ConfettiCelebration 
            duration={1500} 
            particleCount={50} 
          onComplete={() => setShowConfetti(false)} 
        />
        </div>
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
      
      <Footer />
    </div>
  );
}
