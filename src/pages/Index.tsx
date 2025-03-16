
import { useState, useEffect, useRef, useCallback } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useNavigate } from "react-router-dom";
import { useInfiniteSearch, DiagramResult } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showSearchField, setShowSearchField] = useState(true);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState<Set<string>>(new Set());
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { 
    hasReachedLimit, 
    incrementCount, 
    requiresLogin
  } = useSearchLimit();
  
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

  const handleAIPrompt = async (prompt: string, mode: "search" | "generate") => {
    if (requiresLogin) {
      setShowLoginRequired(true);
      return;
    }
    
    if (hasReachedLimit && mode !== 'generate') {
      setShowPremiumDialog(true);
      return;
    }
    
    if (mode === "search") {
      const success = await incrementCount();
      if (!success) {
        setShowPremiumDialog(true);
        return;
      }
    }
    
    setShowSearchField(false);
    await searchFor(prompt, mode);
  };

  const handleNewSearch = () => {
    setShowSearchField(true);
    resetSearch();
  };

  const handleSaveDiagram = async (diagramId: string | number) => {
    if (!user) {
      setShowLoginRequired(true);
      return;
    }
    
    try {
      const diagramToSave = results.find(r => r.id === diagramId);
      if (diagramToSave) {
        // Save diagram logic
        const isSaved = savedDiagrams.has(String(diagramId));
        
        if (isSaved) {
          // Remove from saved
          const { error } = await supabase
            .from('saved_diagrams')
            .delete()
            .eq('user_id', user.id)
            .eq('diagram_id', String(diagramId));
          
          if (error) throw error;
          
          // Update local state
          const newSaved = new Set(savedDiagrams);
          newSaved.delete(String(diagramId));
          setSavedDiagrams(newSaved);
          
          toast.success(`"${diagramToSave.title}" removed from your bookmarks`);
        } else {
          // Add to saved
          const { error } = await supabase
            .from('saved_diagrams')
            .insert({
              user_id: user.id,
              diagram_id: String(diagramId),
              diagram_data: diagramToSave
            });
          
          if (error) throw error;
          
          // Update local state
          const newSaved = new Set(savedDiagrams);
          newSaved.add(String(diagramId));
          setSavedDiagrams(newSaved);
          
          toast.success(`"${diagramToSave.title}" saved to your bookmarks!`);
        }
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast.error('Failed to save diagram. Please try again.');
    }
  };

  const fetchSavedDiagrams = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_diagrams')
        .select('diagram_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const savedIds = new Set(data.map(item => item.diagram_id));
        setSavedDiagrams(savedIds);
      }
    } catch (error) {
      console.error('Error fetching saved diagrams:', error);
    }
  }, [user]);

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  useEffect(() => {
    fetchSavedDiagrams();
  }, [fetchSavedDiagrams]);

  useEffect(() => {
    if (requiresLogin && !user) {
      setShowLoginRequired(true);
    }
  }, [requiresLogin, user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {showSearchField ? (
          <HeroSection onSearch={handleAIPrompt} isLoading={isLoading} />
        ) : (
          <ResultsSection 
            results={results} 
            searchTerm={searchTerm} 
            onNewSearch={handleNewSearch} 
            isLoading={isLoading}
            lastAction={lastAction}
            onSaveDiagram={handleSaveDiagram}
            savedDiagrams={savedDiagrams}
            lastResultRef={lastResultRef}
          />
        )}
      </main>
      
      <Footer />
      
      <PremiumPlanDialog
        open={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        showLogin={requiresLogin}
        onLoginClick={handleLoginRedirect}
      />
      
      <PremiumPlanDialog
        open={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        showLogin={true}
        onLoginClick={handleLoginRedirect}
      />
    </div>
  );
};

export default Index;
