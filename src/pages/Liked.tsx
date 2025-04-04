import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Bookmark, Search, Loader2, Heart, FolderPlus, Folder, Edit, X, Eye, Grid, ListFilter, Tag, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccess } from "@/components/access-context";
import { Label } from "@/components/ui/label";
import { Json } from "@/integrations/supabase/types";

interface DiagramData {
  id: string;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
  isGenerated?: boolean;
}

interface LikedDiagram {
  id: string;
  user_id: string;
  diagram_id: string;
  diagram_data: DiagramData;
  created_at: string;
  folder?: string | null;
}

interface Folder {
  id: string;
  name: string;
  color: string;
}

export default function Liked() {
  const { user, profile } = useAuth();
  const { isPremiumUser } = useAccess();
  const [likedDiagrams, setLikedDiagrams] = useState<LikedDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [folders, setFolders] = useState<Folder[]>([
    { id: "study", name: "Study Materials", color: "bg-blue-500" },
    { id: "reference", name: "Reference Diagrams", color: "bg-green-500" },
    { id: "favorites", name: "Favorites", color: "bg-amber-500" },
  ]);
  const [selectedImage, setSelectedImage] = useState<DiagramData | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      toast.error("Please sign in to view your liked diagrams");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchLikedDiagrams = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('saved_diagrams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            diagram_id: item.diagram_id,
            created_at: item.created_at,
            diagram_data: item.diagram_data as unknown as DiagramData,
            folder: item.folder
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

  const handleRemoveDiagram = async (diagramId: string) => {
    try {
      await supabase
        .from('saved_diagrams')
        .delete()
        .eq('id', diagramId);
        
      setLikedDiagrams(prev => prev.filter(d => d.id !== diagramId));
      toast.success("Diagram removed from liked items");
    } catch (error) {
      console.error('Error removing liked diagram:', error);
      toast.error('Failed to remove diagram');
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newFolder: Folder = {
      id: newFolderName.toLowerCase().replace(/\s+/g, '-'),
      name: newFolderName,
      color: randomColor
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName("");
    setShowNewFolderModal(false);
    toast.success(`Folder "${newFolderName}" created`);
  };

  const handleAssignFolder = async (diagramId: string, folderId: string | null) => {
    try {
      await supabase
        .from('saved_diagrams')
        .update({ folder: folderId })
        .eq('id', diagramId);
      
      setLikedDiagrams(prev => 
        prev.map(diagram => 
          diagram.id === diagramId 
            ? { ...diagram, folder: folderId } 
            : diagram
        )
      );
      
      toast.success(folderId 
        ? `Diagram moved to "${folders.find(f => f.id === folderId)?.name}"` 
        : "Diagram removed from folder"
      );
      
      setSelectedDiagram(null);
      setSelectedFolder(null);
    } catch (error) {
      console.error('Error assigning folder:', error);
      toast.error('Failed to update diagram folder');
    }
  };

  const filteredDiagrams = activeTab === "all" 
    ? likedDiagrams 
    : likedDiagrams.filter(diagram => diagram.folder === activeTab);

  const uniqueTags = Array.from(new Set(
    filteredDiagrams
      .flatMap(diagram => diagram.diagram_data.tags || [])
      .filter(Boolean)
  ));

  return (
    <div className={`flex flex-col min-h-screen ${isPremiumUser ? "bg-gradient-to-b from-background to-background/95" : "bg-background"}`}>
      <Header />
      
      <main className="flex-1 container py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className={`h-5 w-5 ${isPremiumUser ? "text-purple-500" : "text-primary"}`} />
              Your Liked Diagrams
              {isPremiumUser && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-flex px-2 py-0.5 text-xs bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20"
                >
                  Premium
                </motion.span>
              )}
            </h1>
            <p className="text-muted-foreground">Organize and review your saved diagrams</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="flex items-center gap-1.5"
            >
              {viewMode === "grid" ? (
                <>
                  <ListFilter className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4" />
                  Grid View
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setShowNewFolderModal(true)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1.5"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
            
            <Button onClick={() => navigate('/')} variant="default" size="sm" className="flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              <span>Find more</span>
            </Button>
          </div>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-muted/50 p-1 overflow-x-auto flex w-full justify-start no-scrollbar">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-1.5 data-[state=active]:bg-background"
            >
              <Bookmark className="h-4 w-4" />
              <span>All diagrams</span>
            </TabsTrigger>
            
            {folders.map(folder => (
              <TabsTrigger 
                key={folder.id} 
                value={folder.id}
                className="flex items-center gap-1.5 data-[state=active]:bg-background"
              >
                <span className={`h-2 w-2 rounded-full ${folder.color}`} />
                <span>{folder.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : likedDiagrams.length > 0 ? (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                  <h1 className="text-2xl font-bold">Your Liked Diagrams</h1>
                  
                  <div className="relative w-full md:w-auto">
                    <AnimatePresence>
                      {uniqueTags.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-wrap gap-2 p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/40"
                        >
                          {showAllTags ? (
                            <>
                              <Badge 
                                variant={!selectedTag ? "default" : "outline"}
                                className={`cursor-pointer transition-all hover:bg-primary/20 ${!selectedTag ? 'bg-primary text-primary-foreground' : ''}`}
                                onClick={() => setSelectedTag(null)}
                              >
                                All
                              </Badge>
                              
                              {uniqueTags.map(tag => (
                                <Badge 
                                  key={tag}
                                  variant={selectedTag === tag ? "default" : "outline"}
                                  className={`cursor-pointer transition-all hover:bg-primary/20 ${selectedTag === tag ? 'bg-primary text-primary-foreground' : ''}`}
                                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              
                              {uniqueTags.length > 5 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setShowAllTags(false)}
                                >
                                  Show Less
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Badge 
                                variant={!selectedTag ? "default" : "outline"}
                                className={`cursor-pointer transition-all hover:bg-primary/20 ${!selectedTag ? 'bg-primary text-primary-foreground' : ''}`}
                                onClick={() => setSelectedTag(null)}
                              >
                                All
                              </Badge>
                              
                              {uniqueTags.slice(0, 5).map(tag => (
                                <Badge 
                                  key={tag}
                                  variant={selectedTag === tag ? "default" : "outline"}
                                  className={`cursor-pointer transition-all hover:bg-primary/20 ${selectedTag === tag ? 'bg-primary text-primary-foreground' : ''}`}
                                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              
                              {uniqueTags.length > 5 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setShowAllTags(true)}
                                >
                                  +{uniqueTags.length - 5} More
                                </Button>
                              )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <AnimatePresence>
                    {filteredDiagrams.map((diagram, index) => (
                      <motion.div
                        key={diagram.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        <DiagramCard
                          diagram={diagram}
                          viewMode="grid"
                          isLiked={true}
                          onLike={() => handleRemoveDiagram(diagram.id)}
                          onTagClick={(tag) => setSelectedTag(tag)}
                          className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-medium mb-2">No liked diagrams yet</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  When you find diagrams you like, click the heart icon to save them here for easy access later.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Find diagrams
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your diagrams
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Name
              </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Physics Diagrams"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-1">
            {selectedImage && (
              <img 
                src={selectedImage.imageSrc} 
                alt={selectedImage.title} 
                className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-md"
              />
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedImage?.author ? `By: ${selectedImage.author}` : ''}
            </div>
            <Button onClick={() => setShowImageModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
