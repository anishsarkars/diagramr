import { useState, useEffect, useRef, useCallback } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useNavigate } from "react-router-dom";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";

const Index = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [showSearchField, setShowSearchField] = useState(true);
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { incrementCount, hasReachedLimit, requiresLogin } = useSearchLimit();
  
  const { 
    results,
    isLoading,
    hasMore,
    loadMore,
    searchTerm,
    searchFor,
    lastAction,
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

  const handleSearch = async (prompt: string, mode: "search" | "generate") => {
    // Check if user has reached limit
    if (hasReachedLimit) {
      if (requiresLogin) {
        // User needs to login first
        if (onLoginClick) {
          onLoginClick();
        } else {
          navigate("/auth");
        }
      } else {
        // User needs to upgrade
        setShowPremiumDialog(true);
      }
      return;
    }
    
    // Track usage for logged-in users
    incrementCount();
    
    // Clear session storage to ensure fresh results
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('diagramr-search-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    setShowSearchField(false);
    await searchFor(prompt, mode);
  };

  const handleNewSearch = () => {
    setShowSearchField(true);
    resetSearch();
  };

  const handleLikeDiagram = async (diagramId: string | number) => {
    if (!user) {
      // Allow likes without login during beta
      const newLiked = new Set(likedDiagrams);
      if (newLiked.has(String(diagramId))) {
        newLiked.delete(String(diagramId));
        toast.success("Removed from your liked diagrams");
      } else {
        newLiked.add(String(diagramId));
        toast.success("Added to your liked diagrams");
      }
      setLikedDiagrams(newLiked);
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
            lastAction={lastAction}
            onLike={handleLikeDiagram}
            likedDiagrams={likedDiagrams}
            lastResultRef={lastResultRef}
            hasMore={hasMore}
          />
        )}
      </main>
      
      <Footer />
      
      <PremiumPlanDialog 
        open={showPremiumDialog} 
        onClose={() => setShowPremiumDialog(false)} 
        showLogin={requiresLogin}
        onLoginClick={onLoginClick || (() => navigate("/auth"))}
      />
    </div>
  );
};

export default Index;
