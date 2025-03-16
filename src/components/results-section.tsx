import { Button } from "@/components/ui/button";
import { DiagramCard } from "./diagram-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, LayoutGrid, Download, BookOpen, Search, SlidersHorizontal, Grid2X2, List, BookmarkPlus } from "lucide-react";
import { BuiltByBadge } from "./built-by-badge";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DiagramData {
  id: number | string;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
  isGenerated?: boolean;
}

interface ResultsSectionProps {
  results: DiagramData[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction: "search" | "generate";
  onSaveDiagram: (diagramId: string | number) => void;
}

export function ResultsSection({ results, searchTerm, onNewSearch, isLoading, lastAction, onSaveDiagram }: ResultsSectionProps) {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramData | null>(null);
  
  const allTags = results.flatMap(result => result.tags || []);
  const uniqueTags = [...new Set(allTags)];
  
  const filteredResults = selectedTag 
    ? results.filter(result => result.tags?.includes(selectedTag))
    : results;

  const handleBookmark = (diagram: DiagramData) => {
    onSaveDiagram(diagram.id);
    toast.success(`Added "${diagram.title}" to favorites`);
  };
  
  const handleSaveImage = (diagram: DiagramData) => {
    toast.success(`Downloaded "${diagram.title}"`);
    const anchor = document.createElement('a');
    anchor.href = diagram.imageSrc;
    anchor.download = `${diagram.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };
  
  const handleStudyMode = (diagram: DiagramData) => {
    setSelectedDiagram(diagram);
    setStudyMode(true);
  };
  
  const closeStudyMode = () => {
    setStudyMode(false);
    setSelectedDiagram(null);
  };
  
  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-16">
        <div className="relative w-12 h-12 mb-4">
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {lastAction === "search" ? "Searching for diagrams..." : "Generating your diagram..."}
        </p>
      </div>
    );
  }
  
  if (studyMode && selectedDiagram) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={closeStudyMode}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to results</span>
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5"
                onClick={() => handleBookmark(selectedDiagram)}
              >
                <BookmarkPlus className="h-4 w-4" />
                <span>Save</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5"
                onClick={() => handleSaveImage(selectedDiagram)}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
          
          <motion.div 
            className="bg-card rounded-lg shadow-lg overflow-hidden border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedDiagram.title}</h2>
              {selectedDiagram.author && (
                <p className="text-sm text-muted-foreground mb-4">
                  Created by {selectedDiagram.author}
                </p>
              )}
            </div>
            
            <div className="border-t border-border">
              <div className="aspect-auto max-h-[70vh] overflow-hidden flex items-center justify-center bg-muted/10">
                <img 
                  src={selectedDiagram.imageSrc} 
                  alt={selectedDiagram.title} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
            
            {selectedDiagram.tags && selectedDiagram.tags.length > 0 && (
              <div className="p-6 border-t border-border">
                <h3 className="text-sm font-medium mb-2">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDiagram.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-primary/10 text-primary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Related Diagrams</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results
                .filter(d => d.id !== selectedDiagram.id)
                .slice(0, 3)
                .map((diagram, index) => (
                  <motion.div
                    key={diagram.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <DiagramCard
                      title={diagram.title}
                      imageSrc={diagram.imageSrc}
                      author={diagram.author}
                      authorUsername={diagram.authorUsername}
                      tags={diagram.tags}
                      sourceUrl={diagram.sourceUrl}
                      isGenerated={diagram.isGenerated}
                      onClick={() => {
                        setSelectedDiagram(diagram);
                        window.scrollTo(0, 0);
                      }}
                      onSave={() => handleBookmark(diagram)}
                    />
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <motion.div 
            className="flex items-center gap-2 mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-xs p-2 h-8"
              onClick={onNewSearch}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>New Search</span>
            </Button>
          </motion.div>
          
          <motion.h2 
            className="text-xl font-medium"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {lastAction === "search" ? "Results for:" : "Generated for:"} <span className="text-primary">{searchTerm}</span>
          </motion.h2>
          
          <motion.p
            className="text-xs text-muted-foreground mt-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Found {filteredResults.length} {filteredResults.length === 1 ? 'diagram' : 'diagrams'} • Click on any diagram to study in detail
          </motion.p>
        </div>
        
        <motion.div 
          className="flex gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSelectedTag(null)}>
                  <span className="font-medium">All tags</span>
                </DropdownMenuItem>
                {uniqueTags.map(tag => (
                  <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                {viewType === "grid" ? (
                  <Grid2X2 className="h-3.5 w-3.5" />
                ) : (
                  <List className="h-3.5 w-3.5" />
                )}
                <span>View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setViewType("grid")}>
                <Grid2X2 className="h-4 w-4 mr-2" />
                <span>Grid view</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewType("list")}>
                <List className="h-4 w-4 mr-2" />
                <span>List view</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-background/60 backdrop-blur-md">
          <TabsTrigger value="all" className="text-xs">All Results</TabsTrigger>
          <TabsTrigger value="diagrams" className="text-xs">Diagrams</TabsTrigger>
          <TabsTrigger value="infographics" className="text-xs">Infographics</TabsTrigger>
          <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {viewType === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {filteredResults.map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <DiagramCard
                    title={diagram.title}
                    imageSrc={diagram.imageSrc}
                    author={diagram.author}
                    authorUsername={diagram.authorUsername}
                    tags={diagram.tags}
                    sourceUrl={diagram.sourceUrl}
                    isGenerated={diagram.isGenerated}
                    onClick={() => handleStudyMode(diagram)}
                    onSave={() => handleBookmark(diagram)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {filteredResults.map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex flex-col md:flex-row gap-4 border border-border rounded-lg overflow-hidden bg-card"
                >
                  <div className="md:w-1/3 aspect-video">
                    <img 
                      src={diagram.imageSrc} 
                      alt={diagram.title} 
                      className="w-full h-full object-cover"
                      onClick={() => handleStudyMode(diagram)}
                    />
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium mb-2 line-clamp-1">{diagram.title}</h3>
                    {diagram.author && (
                      <p className="text-xs text-muted-foreground mb-3">
                        By {diagram.author}
                      </p>
                    )}
                    {diagram.tags && (
                      <div className="flex flex-wrap gap-1 mt-auto mb-4">
                        {diagram.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {diagram.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{diagram.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        size="sm" 
                        onClick={() => handleStudyMode(diagram)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookmark(diagram)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="diagrams" className="mt-0">
          {viewType === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {filteredResults.filter((_, index) => index % 2 === 0).map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <DiagramCard
                    title={diagram.title}
                    imageSrc={diagram.imageSrc}
                    author={diagram.author}
                    authorUsername={diagram.authorUsername}
                    tags={diagram.tags}
                    sourceUrl={diagram.sourceUrl}
                    isGenerated={diagram.isGenerated}
                    onClick={() => handleStudyMode(diagram)}
                    onSave={() => handleBookmark(diagram)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {filteredResults.filter((_, index) => index % 2 === 0).map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex flex-col md:flex-row gap-4 border border-border rounded-lg overflow-hidden bg-card"
                >
                  <div className="md:w-1/3 aspect-video">
                    <img 
                      src={diagram.imageSrc} 
                      alt={diagram.title} 
                      className="w-full h-full object-cover"
                      onClick={() => handleStudyMode(diagram)}
                    />
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium mb-2 line-clamp-1">{diagram.title}</h3>
                    {diagram.author && (
                      <p className="text-xs text-muted-foreground mb-3">
                        By {diagram.author}
                      </p>
                    )}
                    {diagram.tags && (
                      <div className="flex flex-wrap gap-1 mt-auto mb-4">
                        {diagram.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {diagram.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{diagram.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        size="sm" 
                        onClick={() => handleStudyMode(diagram)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookmark(diagram)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="infographics" className="mt-0">
          {viewType === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {filteredResults.filter((_, index) => index % 3 === 0).map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <DiagramCard
                    title={diagram.title}
                    imageSrc={diagram.imageSrc}
                    author={diagram.author}
                    authorUsername={diagram.authorUsername}
                    tags={diagram.tags}
                    sourceUrl={diagram.sourceUrl}
                    isGenerated={diagram.isGenerated}
                    onClick={() => handleStudyMode(diagram)}
                    onSave={() => handleBookmark(diagram)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {filteredResults.filter((_, index) => index % 3 === 0).map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex flex-col md:flex-row gap-4 border border-border rounded-lg overflow-hidden bg-card"
                >
                  <div className="md:w-1/3 aspect-video">
                    <img 
                      src={diagram.imageSrc} 
                      alt={diagram.title} 
                      className="w-full h-full object-cover"
                      onClick={() => handleStudyMode(diagram)}
                    />
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium mb-2 line-clamp-1">{diagram.title}</h3>
                    {diagram.author && (
                      <p className="text-xs text-muted-foreground mb-3">
                        By {diagram.author}
                      </p>
                    )}
                    {diagram.tags && (
                      <div className="flex flex-wrap gap-1 mt-auto mb-4">
                        {diagram.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {diagram.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{diagram.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        size="sm" 
                        onClick={() => handleStudyMode(diagram)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookmark(diagram)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          {viewType === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {filteredResults.filter((_, index) => index % 4 === 0).map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <DiagramCard
                    title={diagram.title}
                    imageSrc={diagram.imageSrc}
                    author={diagram.author}
                    authorUsername={diagram.authorUsername}
                    tags={diagram.tags}
                    sourceUrl={diagram.sourceUrl}
                    isGenerated={diagram.isGenerated}
                    onClick={() => handleStudyMode(diagram)}
                    onSave={() => handleBookmark(diagram)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {filteredResults.filter((_, index) => index % 4 === 0).map((diagram, index) => (
                <motion.div
                  key={diagram.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex flex-col md:flex-row gap-4 border border-border rounded-lg overflow-hidden bg-card"
                >
                  <div className="md:w-1/3 aspect-video">
                    <img 
                      src={diagram.imageSrc} 
                      alt={diagram.title} 
                      className="w-full h-full object-cover"
                      onClick={() => handleStudyMode(diagram)}
                    />
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium mb-2 line-clamp-1">{diagram.title}</h3>
                    {diagram.author && (
                      <p className="text-xs text-muted-foreground mb-3">
                        By {diagram.author}
                      </p>
                    )}
                    {diagram.tags && (
                      <div className="flex flex-wrap gap-1 mt-auto mb-4">
                        {diagram.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {diagram.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{diagram.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        size="sm" 
                        onClick={() => handleStudyMode(diagram)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookmark(diagram)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <BuiltByBadge position="bottom-right" />
    </motion.div>
  );
}
