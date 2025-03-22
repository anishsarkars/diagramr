
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
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { incrementCount, hasReachedLimit, requiresLogin, remainingSearches } = useSearchLimit();
  
  const { 
    results,
    isLoading,
    hasMore,
    loadMore,
    searchTerm,
    searchFor,
    error,
    resetSearch
  } = useInfiniteSearch();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastResultRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  const handleSearch = async (prompt: string) => {
    // Check if user has reached limit
    if (hasReachedLimit) {
      if (requiresLogin) {
        // User needs to login first
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
        // User needs to upgrade
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
    
    // Increment count and track usage
    const success = await incrementCount();
    if (!success) return;
    
    // Clear session storage to ensure fresh results
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('diagramr-search-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    setShowSearchField(false);
    try {
      await searchFor(prompt);
      
      // Show remaining searches toast
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
      if (error.message === 'API quota exceeded') {
        toast.error("API quota exceeded", {
          description: "Sorry for the inconvenience! Our API quota has been reached. We're working on increasing our limits to serve you better.",
          duration: 8000
        });
      }
    }
  };

  const handleNewSearch = () => {
    setShowSearchField(true);
    resetSearch();
  };

  const handleLikeDiagram = async (diagramId: string | number) => {
    if (!user) {
      // Require login to like diagrams
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
          // Remove from liked
          const { error } = await supabase
            .from('saved_diagrams')
            .delete()
            .eq('user_id', user.id)
            .eq('diagram_id', String(diagramId));
          
          if (error) throw error;
          
          // Update local state
          const newLiked = new Set(likedDiagrams);
          newLiked.delete(String(diagramId));
          setLikedDiagrams(newLiked);
          
          toast.success("Diagram removed from favorites");
        } else {
          // Add to liked
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
          
          // Update local state
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

  // Handle API quota errors
  useEffect(() => {
    if (error && error.message === 'API quota exceeded') {
      toast.error("API quota exceeded", {
        description: "Sorry for the inconvenience! Our API quota has been reached. We're working on increasing our limits to serve you better.",
        duration: 8000
      });
    }
  }, [error]);

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
            isLoading={isLoading}
            lastAction="search"
            onLike={handleLikeDiagram}
            likedDiagrams={likedDiagrams}
            lastResultRef={lastResultRef}
            hasMore={hasMore}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
