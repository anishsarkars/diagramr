import { DiagramResult } from "@/hooks/use-infinite-search";
import { Button } from "@/components/ui/button";
import { DiagramCard } from "@/components/diagram-card";
import { 
  SearchIcon, 
  Loader2Icon, 
  HomeIcon,
  AlertCircleIcon,
  GraduationCapIcon,
  YoutubeIcon,
  BookOpenIcon,
  LinkIcon
} from "lucide-react";
import { SimpleSearchBar } from "@/components/simple-search-bar";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedContainer } from "@/components/animated-container";
import { useInView } from "react-intersection-observer";
import { DiagramPreviewModal } from "@/components/diagram-preview-modal";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface ResultsSectionProps {
  results: DiagramResult[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction: "search" | "generate";
  onLike?: (id: string | number) => void;
  likedDiagrams?: Set<string>;
  lastResultRef?: (node: HTMLDivElement) => void;
  hasMore: boolean;
}

interface EducationalResource {
  id: string;
  title: string;
  type: "video" | "article" | "tutorial" | "course";
  url: string;
  platform: string;
  thumbnail?: string;
  description?: string;
}

export function ResultsSection({ 
  results, 
  searchTerm, 
  onNewSearch, 
  isLoading,
  lastAction,
  onLike,
  likedDiagrams = new Set(),
  lastResultRef,
  hasMore
}: ResultsSectionProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [educationalResources, setEducationalResources] = useState<EducationalResource[]>([]);
  const [showResources, setShowResources] = useState(false);
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true });
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const isLiked = (id: string | number) => likedDiagrams.has(String(id));

  const handleLike = (id: string | number) => {
    if (onLike) {
      onLike(id);
    }
  };
  
  const openDiagramPreview = (diagram: DiagramResult) => {
    setSelectedDiagram(diagram);
    setPreviewOpen(true);
  };
  
  const closeDiagramPreview = () => {
    setPreviewOpen(false);
  };
  
  const goToHome = () => {
    onNewSearch();
  };

  useEffect(() => {
    if (!searchTerm) return;
    
    const generateEducationalResources = (query: string): EducationalResource[] => {
      const lowerQuery = query.toLowerCase();
      
      const resources: { [key: string]: EducationalResource[] } = {
        "biology": [
          {
            id: "biology-video-1",
            title: "Cell Structure and Function Explained",
            type: "video",
            url: "https://www.youtube.com/watch?v=URUJD5NEXC8",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/URUJD5NEXC8/mqdefault.jpg",
            description: "Comprehensive explanation of cell structures and their functions"
          },
          {
            id: "biology-article-1",
            title: "Cell Biology: Detailed Guide with Diagrams",
            type: "article",
            url: "https://www.khanacademy.org/science/biology/structure-of-a-cell",
            platform: "Khan Academy",
            description: "Free educational resource with interactive diagrams"
          },
          {
            id: "biology-course-1",
            title: "Biology 101: Understanding Cell Structures",
            type: "course",
            url: "https://www.coursera.org/learn/cell-biology",
            platform: "Coursera",
            description: "Free to audit, university-level course with certificates available"
          }
        ],
        
        "chemistry": [
          {
            id: "chemistry-video-1",
            title: "Periodic Table Explained: Elements and Trends",
            type: "video",
            url: "https://www.youtube.com/watch?v=rz4Dd1I_fX0",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/rz4Dd1I_fX0/mqdefault.jpg",
            description: "Visual explanation of the periodic table and element properties"
          },
          {
            id: "chemistry-article-1",
            title: "Interactive Periodic Table with Detailed Information",
            type: "article",
            url: "https://ptable.com/",
            platform: "PTable",
            description: "Free interactive periodic table with comprehensive element data"
          }
        ],
        
        "physics": [
          {
            id: "physics-video-1",
            title: "Understanding Force Diagrams and Newton's Laws",
            type: "video",
            url: "https://www.youtube.com/watch?v=fo_pmp5rtzo",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/fo_pmp5rtzo/mqdefault.jpg",
            description: "Clear visual explanations of force diagrams and applications"
          },
          {
            id: "physics-article-1",
            title: "Force Diagrams and Free Body Diagrams Explained",
            type: "article",
            url: "https://www.physicsclassroom.com/class/newtlaws/Lesson-2/Free-Body-Diagrams",
            platform: "Physics Classroom",
            description: "Free educational resource with step-by-step explanations"
          }
        ],
        
        "computer science": [
          {
            id: "cs-video-1",
            title: "UML Class Diagrams Explained with Examples",
            type: "video",
            url: "https://www.youtube.com/watch?v=UI6lqHOVHic",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/UI6lqHOVHic/mqdefault.jpg",
            description: "Comprehensive tutorial on creating and reading UML class diagrams"
          },
          {
            id: "cs-article-1",
            title: "UML Class Diagram Tutorial with Examples",
            type: "article",
            url: "https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-class-diagram-tutorial/",
            platform: "Visual Paradigm",
            description: "Free guide with downloadable examples and templates"
          },
          {
            id: "cs-tutorial-1",
            title: "Database Design Tutorial: ER Diagrams",
            type: "tutorial",
            url: "https://www.lucidchart.com/pages/er-diagrams",
            platform: "Lucidchart",
            description: "Free tutorial with templates and examples"
          }
        ],
        
        "math": [
          {
            id: "math-video-1",
            title: "Mathematics Visualizations and Graphs Explained",
            type: "video",
            url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
            platform: "YouTube - 3Blue1Brown",
            thumbnail: "https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg",
            description: "Beautiful visual explanations of mathematical concepts"
          },
          {
            id: "math-article-1",
            title: "Interactive Math Visualizations and Explanations",
            type: "article",
            url: "https://www.desmos.com/calculator",
            platform: "Desmos",
            description: "Free graphing calculator with shared examples"
          }
        ],
        
        "default": [
          {
            id: "general-video-1",
            title: "How to Use Diagrams for Effective Learning",
            type: "video",
            url: "https://www.youtube.com/watch?v=PCsQGSL4n2s",
            platform: "YouTube",
            thumbnail: "https://img.youtube.com/vi/PCsQGSL4n2s/mqdefault.jpg",
            description: "Techniques for using visual learning in your studies"
          },
          {
            id: "general-article-1",
            title: "The Ultimate Guide to Educational Diagram Types",
            type: "article",
            url: "https://www.lucidchart.com/blog/types-of-diagrams",
            platform: "Lucidchart",
            description: "Free guide to different diagram types for students"
          },
          {
            id: "general-tutorial-1",
            title: "How to Create Effective Study Diagrams",
            type: "tutorial",
            url: "https://www.goconqr.com/en/mind-maps/",
            platform: "GoConqr",
            description: "Free mind mapping and diagram tools for students"
          }
        ]
      };
      
      let category = "default";
      
      if (lowerQuery.includes("biology") || 
          lowerQuery.includes("cell") || 
          lowerQuery.includes("organism") ||
          lowerQuery.includes("anatomy")) {
        category = "biology";
      } else if (lowerQuery.includes("chemistry") || 
                lowerQuery.includes("periodic") || 
                lowerQuery.includes("molecular") ||
                lowerQuery.includes("chemical")) {
        category = "chemistry";
      } else if (lowerQuery.includes("physics") || 
                lowerQuery.includes("force") || 
                lowerQuery.includes("motion") ||
                lowerQuery.includes("energy")) {
        category = "physics";
      } else if (lowerQuery.includes("computer") || 
                lowerQuery.includes("uml") ||
                lowerQuery.includes("programming") ||
                lowerQuery.includes("database") ||
                lowerQuery.includes("algorithm") ||
                lowerQuery.includes("data structure") ||
                lowerQuery.includes("dsa")) {
        category = "computer science";
      } else if (lowerQuery.includes("math") ||
                lowerQuery.includes("graph") ||
                lowerQuery.includes("function") ||
                lowerQuery.includes("geometry")) {
        category = "math";
      }
      
      return resources[category] || resources.default;
    };
    
    const newResources = generateEducationalResources(searchTerm);
    setEducationalResources(newResources);
    setShowResources(results.length > 0);
  }, [searchTerm, results.length]);

  return (
    <div className="container py-6 md:py-8 pb-16">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToHome}
            className="mr-2 hidden md:flex"
          >
            <HomeIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToHome}
            className="mr-2 md:hidden"
          >
            <HomeIcon className="h-4 w-4 mr-1.5" />
            <span>Home</span>
          </Button>
          
          <motion.div
            ref={titleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-xl md:text-2xl font-bold">{searchTerm}</h1>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">
              {isLoading ? (
                "Finding the best educational diagrams..."
              ) : results.length > 0 ? (
                `Found ${results.length} educational diagram${results.length > 1 ? "s" : ""}`
              ) : (
                "No diagrams found. Try a different search term."
              )}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <SimpleSearchBar onSearch={onNewSearch} />
        </div>
      </div>

      {showResources && educationalResources.length > 0 && !isLoading && (
        <motion.div 
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-medium flex items-center">
              <GraduationCapIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary" />
              <span>Free Educational Resources for "{searchTerm}"</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {educationalResources.map(resource => (
              <Card key={resource.id} className="hover:shadow-md transition-all duration-300 h-full">
                <CardHeader className="pb-2 pt-3 px-3 md:px-4">
                  <CardTitle className="text-sm md:text-base flex items-center gap-2">
                    {resource.type === "video" && <YoutubeIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500" />}
                    {resource.type === "article" && <BookOpenIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />}
                    {resource.type === "tutorial" && <GraduationCapIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />}
                    {resource.type === "course" && <GraduationCapIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500" />}
                    <span className="line-clamp-1">{resource.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">{resource.platform}</CardDescription>
                </CardHeader>
                <CardContent className="pb-1 pt-0 px-3 md:px-4">
                  {resource.thumbnail && resource.type === "video" && (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted mb-2">
                      <img 
                        src={resource.thumbnail} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {resource.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {resource.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pb-3 pt-1 px-3 md:px-4">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full h-8 text-xs" size="sm">
                      <LinkIcon className="h-3 w-3 mr-1.5" />
                      Access Free {resource.type === "video" ? "Video" : 
                                resource.type === "article" ? "Article" : 
                                resource.type === "course" ? "Course" : "Tutorial"}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20">
            <AnimatedContainer className="flex flex-col items-center justify-center">
              <SearchIcon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4 animate-pulse" />
              <h3 className="text-lg md:text-xl font-medium mb-2">
                Searching for educational diagrams...
              </h3>
              <p className="text-muted-foreground max-w-md text-center text-sm md:text-base">
                We're finding the most relevant educational diagrams for your search.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="text-xs md:text-sm text-muted-foreground">This may take a moment</span>
              </div>
            </AnimatedContainer>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <AnimatedContainer className="flex flex-col items-center">
              <AlertCircleIcon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg md:text-xl font-medium mb-2">No educational diagrams found</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm px-4">
                We couldn't find any educational diagrams matching your search. Try using different keywords.
              </p>
              <Button onClick={onNewSearch} className="mt-6">Try a different search</Button>
            </AnimatedContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              if (results.length === index + 1) {
                return (
                  <div ref={lastResultRef} key={result.id}>
                    <DiagramCard
                      title={result.title}
                      imageSrc={result.imageSrc}
                      author={result.author}
                      authorUsername={result.authorUsername}
                      sourceUrl={result.sourceUrl}
                      tags={result.tags}
                      isGenerated={result.isGenerated}
                      isLiked={isLiked(result.id)}
                      onLike={() => handleLike(result.id)}
                      onClick={() => openDiagramPreview(result)}
                    />
                  </div>
                );
              } else {
                return (
                  <DiagramCard
                    key={result.id}
                    title={result.title}
                    imageSrc={result.imageSrc}
                    author={result.author}
                    authorUsername={result.authorUsername}
                    sourceUrl={result.sourceUrl}
                    tags={result.tags}
                    isGenerated={result.isGenerated}
                    isLiked={isLiked(result.id)}
                    onLike={() => handleLike(result.id)}
                    onClick={() => openDiagramPreview(result)}
                  />
                );
              }
            })}
          </div>
        )}
      </AnimatePresence>
      
      {!isLoading && results.length > 0 && hasMore && (
        <div className="flex justify-center mt-6 md:mt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <span className="text-xs md:text-sm">Loading more educational diagrams...</span>
          </div>
        </div>
      )}
      
      {!isLoading && results.length > 0 && !hasMore && (
        <div className="text-center mt-6 md:mt-8 py-4">
          <p className="text-muted-foreground text-xs md:text-sm">You've reached the end of the educational resources</p>
          <Button variant="outline" onClick={onNewSearch} className="mt-4">
            New Search
          </Button>
        </div>
      )}
      
      <DiagramPreviewModal
        open={previewOpen}
        onClose={closeDiagramPreview}
        diagram={selectedDiagram}
        onLike={selectedDiagram ? () => handleLike(selectedDiagram.id) : undefined}
        isLiked={selectedDiagram ? isLiked(selectedDiagram.id) : false}
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
