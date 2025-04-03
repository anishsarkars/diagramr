
import { useState, useEffect, useCallback } from "react";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ChatInterface } from "@/components/chat-interface";
import { ConfettiCelebration } from "@/components/confetti-celebration";

export default function ChatDashboard() {
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  
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
    resetSearch
  } = useInfiniteSearch({
    pageSize: 20
  });
  
  useEffect(() => {
    // Check if user just logged in
    const lastLoginCelebration = localStorage.getItem('last-login-celebration');
    const now = Date.now();
    
    if (user && (!lastLoginCelebration || now - parseInt(lastLoginCelebration) > 60 * 60 * 1000)) {
      setShowCelebration(true);
      localStorage.setItem('last-login-celebration', now.toString());
      
      // Auto-hide after animation
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
    
    // Fetch liked diagrams
    if (user) {
      fetchLikedDiagrams();
    }
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
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
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
    
    try {
      await searchFor(query);
      
      // Update search history
      const savedHistory = localStorage.getItem('diagramr-search-history');
      let history: string[] = [];
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Error parsing search history:', e);
        }
      }
      
      const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      // Show remaining searches info
      if (remainingSearches <= 5 && remainingSearches > 0) {
        toast.info(`${remainingSearches} searches remaining today`, {
          description: user ? "Upgrade for unlimited searches" : "Sign in for more searches/day"
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again or use different terms.");
    }
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

  return (
    <DashboardLayout>
      {showCelebration && (
        <ConfettiCelebration 
          duration={3000} 
          particleCount={100}
          intensity="high"
        />
      )}
      
      <ChatInterface
        onSearch={handleSearch}
        searchResults={results}
        searchTerm={searchTerm}
        isLoading={isLoading}
        onLike={handleLikeDiagram}
        likedDiagrams={likedDiagrams}
      />
    </DashboardLayout>
  );
}
