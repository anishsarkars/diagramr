
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Youtube, FileText, Lightbulb, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { generateRelatedResources, ResourceItem } from "@/utils/gemini-ai";
import { useAccess } from "@/components/access-context";

interface RecommendationsSectionProps {
  searchQuery: string;
  className?: string;
}

export function RecommendationsSection({ searchQuery, className }: RecommendationsSectionProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isPremium } = useAccess();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!searchQuery.trim()) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await generateRelatedResources(searchQuery);
        
        if (response.resources && response.resources.length > 0) {
          setResources(response.resources);
        } else if (response.error) {
          setError(response.error);
        } else {
          setError("No recommendations found");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchQuery]);

  const getIconForResourceType = (type: ResourceItem["type"]) => {
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
              
              // Retry fetching recommendations
              generateRelatedResources(searchQuery)
                .then(response => {
                  if (response.resources && response.resources.length > 0) {
                    setResources(response.resources);
                  } else {
                    setError("Still no recommendations found");
                  }
                })
                .catch(err => {
                  setError("Failed to load recommendations");
                })
                .finally(() => {
                  setIsLoading(false);
                });
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
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        Related Resources
        {!isPremium && (
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
            Free Preview
          </span>
        )}
      </h3>
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
