
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Youtube, FileText, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "course" | "video" | "article" | "resource";
  source?: string;
  imageUrl?: string;
}

interface RecommendationsSectionProps {
  searchQuery: string;
  className?: string;
}

export function RecommendationsSection({ searchQuery, className }: RecommendationsSectionProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!searchQuery.trim()) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // For now, we'll use a mock API call that returns hardcoded results based on the query
        // In a real implementation, this would call an external API
        setTimeout(() => {
          const mockResults = generateMockResults(searchQuery);
          setResources(mockResults);
          setIsLoading(false);
        }, 1500);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations");
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchQuery]);

  // Generate mock results based on the search query
  const generateMockResults = (query: string): Resource[] => {
    const cleanQuery = query.toLowerCase().trim();
    const defaultResources: Resource[] = [
      {
        id: "1",
        title: `Learn ${capitalizeFirstLetter(cleanQuery)} - Comprehensive Course`,
        description: `Master ${capitalizeFirstLetter(cleanQuery)} with this step-by-step interactive course.`,
        url: "https://example.com/course",
        type: "course",
        source: "Example Learning",
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&q=80"
      },
      {
        id: "2",
        title: `${capitalizeFirstLetter(cleanQuery)} Explained - Video Tutorial`,
        description: `Watch this video tutorial to understand ${cleanQuery} concepts visually.`,
        url: "https://example.com/video",
        type: "video",
        source: "Example Academy",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80"
      },
      {
        id: "3",
        title: `Understanding ${capitalizeFirstLetter(cleanQuery)} - Comprehensive Guide`,
        description: `Read this in-depth article about ${cleanQuery} with practical examples.`,
        url: "https://example.com/article",
        type: "article",
        source: "Example Blog",
        imageUrl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=300&q=80"
      },
      {
        id: "4",
        title: `${capitalizeFirstLetter(cleanQuery)} Resources Collection`,
        description: `A curated collection of resources about ${cleanQuery} for all skill levels.`,
        url: "https://example.com/resources",
        type: "resource",
        source: "Example Hub",
        imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&q=80"
      }
    ];

    return defaultResources;
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getIconForResourceType = (type: Resource["type"]) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-4 w-4" />;
      case "video":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "article":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "resource":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className={`mt-8 ${className || ""}`}>
        <h3 className="text-lg font-semibold mb-3">Related Resources</h3>
        <Card className="p-4 text-center text-muted-foreground">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => {
              setIsLoading(true);
              setError(null);
              setTimeout(() => {
                setResources(generateMockResults(searchQuery));
                setIsLoading(false);
              }, 1000);
            }}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`mt-8 ${className || ""}`}>
        <h3 className="text-lg font-semibold mb-3">Related Resources</h3>
        <Card className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className={`mt-8 ${className || ""}`}>
      <h3 className="text-lg font-semibold mb-3">Related Resources</h3>
      <Card className="p-4">
        <div className="space-y-4">
          {resources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 group"
            >
              <div className="mt-1">
                {getIconForResourceType(resource.type)}
              </div>
              <div className="flex-1">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col"
                  onClick={() => {
                    toast.success(`Opening ${resource.title}`, { 
                      description: "Redirecting to external resource" 
                    });
                  }}
                >
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <span>{resource.source}</span>
                    <span>•</span>
                    <span className="capitalize">{resource.type}</span>
                  </div>
                </a>
              </div>
              <div className="self-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  asChild
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={`Open ${resource.title}`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
