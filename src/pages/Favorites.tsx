
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Bookmark, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedDiagram {
  id: string;
  title: string;
  image_url: string;
  user_id: string;
  created_at: string;
}

export default function Favorites() {
  const { user, profile } = useAuth();
  const [favorites, setFavorites] = useState<SavedDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if not logged in or not premium
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!profile?.is_premium) {
      navigate('/');
      toast.error("Favorites is a premium feature");
    }
  }, [user, profile, navigate]);

  // Fetch user's saved diagrams
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // This would be replaced with actual Supabase query once the saved_diagrams table is created
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockFavorites: SavedDiagram[] = [
          {
            id: '1',
            title: 'UML Class Diagram',
            image_url: 'https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/discovery-page/UML-class-diagram/UML-class-diagram-example.png',
            user_id: user.id,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Network Architecture Diagram',
            image_url: 'https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg',
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ];
        
        setFavorites(mockFavorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load your saved diagrams');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Saved Diagrams</h1>
            <p className="text-muted-foreground">Access your favorite diagrams anytime</p>
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
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h2 className="text-xl font-medium">No saved diagrams yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Save diagrams while searching to access them later
            </p>
            <Button onClick={() => navigate('/')} className="mt-4 gap-2">
              <Search className="h-4 w-4" />
              <span>Search for diagrams</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((diagram, index) => (
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
                    Saved on {new Date(diagram.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
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
