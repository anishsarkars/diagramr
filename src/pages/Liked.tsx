
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Bookmark, Search, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikedDiagram {
  id: string;
  title: string;
  image_url: string;
  user_id: string;
  created_at: string;
}

export default function Liked() {
  const { user, profile } = useAuth();
  const [likedDiagrams, setLikedDiagrams] = useState<LikedDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if not logged in or not premium
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      toast.error("Please sign in to view your liked diagrams");
    }
  }, [user, navigate]);

  // Fetch user's liked diagrams
  useEffect(() => {
    const fetchLikedDiagrams = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // For now, we'll use the saved_diagrams table with a different query
        // In a real app, you might want a separate liked_diagrams table
        const { data, error } = await supabase
          .from('saved_diagrams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            title: item.diagram_data?.title || "Untitled Diagram",
            image_url: item.diagram_data?.imageSrc || "",
            user_id: item.user_id,
            created_at: item.created_at
          }));
          
          setLikedDiagrams(formattedData);
        }
      } catch (error) {
        console.error('Error fetching liked diagrams:', error);
        toast.error('Failed to load your liked diagrams');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLikedDiagrams();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Liked Diagrams</h1>
            <p className="text-muted-foreground">Diagrams you've liked across Diagramr</p>
          </div>
          
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            <span>Find more</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : likedDiagrams.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h2 className="text-xl font-medium">No liked diagrams yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't liked any diagrams yet. Start exploring to find diagrams you love!
            </p>
            <Button onClick={() => navigate('/')} className="mt-4 gap-2">
              <Search className="h-4 w-4" />
              <span>Search for diagrams</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedDiagrams.map((diagram, index) => (
              <motion.div
                key={diagram.id}
                className="diagram-card overflow-hidden rounded-xl border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="diagram-card-image">
                  <img src={diagram.image_url} alt={diagram.title} className="w-full aspect-video object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg line-clamp-1">{diagram.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Liked on {new Date(diagram.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">View</Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={async () => {
                        try {
                          await supabase
                            .from('saved_diagrams')
                            .delete()
                            .eq('id', diagram.id);
                            
                          setLikedDiagrams(prev => prev.filter(d => d.id !== diagram.id));
                          toast.success("Diagram removed from liked items");
                        } catch (error) {
                          console.error('Error removing liked diagram:', error);
                          toast.error('Failed to remove diagram');
                        }
                      }}
                    >
                      Unlike
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
