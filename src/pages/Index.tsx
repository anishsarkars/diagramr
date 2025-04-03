
import { useState, useEffect, useRef, useCallback } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useNavigate } from "react-router-dom";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [showSearchField, setShowSearchField] = useState(true);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { incrementCount, hasReachedLimit, requiresLogin, remainingSearches } = useSearchLimit();
  
  // Redirect authenticated users to dashboard
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
    
    // Clear session storage for search results
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('diagramr-search-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    setShowSearchField(false);
    setSelectedTagFilter(null);
    
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
  }, [fetchLikedDiagrams]);

  useEffect(() => {
    if (error && error.message === 'API quota exceeded') {
      toast.error("API quota exceeded", {
        description: "Sorry for the inconvenience! Our API quota has been reached. We're working on increasing our limits to serve you better.",
        duration: 8000
      });
    }
  }, [error]);

  // For debugging
  useEffect(() => {
    console.log("Current results:", results.length);
    console.log("Has more:", hasMore);
    console.log("Is loading:", isLoading);
  }, [results, hasMore, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-16 md:pt-20">
        {showSearchField ? (
          <HeroSection onSearch={handleSearch} isLoading={isLoading} />
        ) : (
          <ResultsSection 
            results={results} 
            searchTerm={searchTerm} 
            onNewSearch={handleNewSearch} 
            onSearch={handleSearch}
            isLoading={isLoading}
            lastAction="search"
            onLike={handleLikeDiagram}
            likedDiagrams={likedDiagrams}
            lastResultRef={lastResultRef}
            hasMore={hasMore}
            loadMore={loadMore}
            selectedTagFilter={selectedTagFilter}
            onSelectTagFilter={setSelectedTagFilter}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default Index;
