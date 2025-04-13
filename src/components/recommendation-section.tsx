
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, BookOpen, Video, FileText, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { findAdditionalResources } from "@/utils/search-service";
import { motion } from "framer-motion";

interface RecommendationSectionProps {
  searchQuery: string;
}

export interface ResourceItem {
  title: string;
  url: string;
  source: string;
  type: "course" | "video" | "article" | "resource";
}

export function RecommendationSection({ searchQuery }: RecommendationSectionProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    if (!searchQuery) return;
    
    async function fetchResources() {
      setLoading(true);
      try {
        const resourcesData = await findAdditionalResources(searchQuery);
        // Ensure the resources have the correct type format
        const validatedResources = resourcesData.map(resource => ({
          ...resource,
          type: validateResourceType(resource.type)
        }));
        setResources(validatedResources);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResources();
  }, [searchQuery]);
  
  // Helper function to validate and normalize resource types
  const validateResourceType = (type: string): "course" | "video" | "article" | "resource" => {
    const normalizedType = type.toLowerCase();
    if (
      normalizedType === "course" || 
      normalizedType === "video" || 
      normalizedType === "article"
    ) {
      return normalizedType as "course" | "video" | "article";
    }
    return "resource";
  };
  
  const filteredResources = activeTab === "all" 
    ? resources 
    : resources.filter(resource => resource.type === activeTab);
  
  const getIcon = (type: string) => {
    switch(type) {
      case "course":
        return <BookOpen className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };
  
  if (!searchQuery) return null;
  
  return (
    <motion.div 
      className="w-full mt-10 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Related Learning Resources</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="px-4 pb-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="course">Courses</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block no-underline"
                    >
                      <Card className="hover:shadow-md transition-shadow border-border/30 h-full">
                        <CardContent className="pt-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getIcon(resource.type)}
                              <span className="capitalize">{resource.type}</span>
                            </Badge>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          
                          <h3 className="font-medium text-base mb-2">{resource.title}</h3>
                          <p className="text-xs text-muted-foreground mt-auto">Source: {resource.source}</p>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No resources found for this category.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}
