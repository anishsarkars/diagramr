import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, ExternalLink, FileType2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface DiagramCardProps {
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  sourceUrl?: string;
  tags?: string[];
  isGenerated?: boolean;
  isLiked?: boolean;
  onLike?: () => void;
  onClick?: () => void;
}

export function DiagramCard({
  title,
  imageSrc,
  author = "Unknown",
  authorUsername = "",
  sourceUrl = "#",
  tags = [],
  isGenerated = false,
  isLiked = false,
  onLike,
  onClick,
}: DiagramCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 2;
  
  const fallbackImages = [
    "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png",
    "/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png",
    "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png",
    "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png"
  ];
  
  const fallbackImage = getFallbackImage();
  
  const retryWithProxy = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setImageError(false);
      setIsLoading(true);
      console.log(`Retrying image load (${retryCount + 1}/${maxRetries}): ${imageSrc}`);
    } else {
      console.log(`Using fallback image after ${maxRetries} retries`);
      setImageError(true);
      setIsLoading(false);
    }
  };
  
  const filterRelevantTags = (tags: string[]) => {
    const diagramKeywords = [
      'diagram', 'chart', 'flow', 'architecture', 'model', 'uml', 'class',
      'entity', 'relationship', 'network', 'topology', 'database', 'schema',
      'sequence', 'structure', 'algorithm', 'visualization', 'system', 'design',
      'data structure', 'computer science', 'educational', 'learning'
    ];
    
    return tags
      .filter(tag => 
        diagramKeywords.some(keyword => tag.toLowerCase().includes(keyword)) ||
        tag.length > 3
      )
      .slice(0, 4);
  };
  
  const filteredTags = filterRelevantTags(tags);
  
  const getImageSrc = () => {
    if (imageError || retryCount >= maxRetries) {
      return fallbackImage;
    }
    
    if (retryCount > 0) {
      const encodedUrl = encodeURIComponent(imageSrc);
      return `https://images.weserv.nl/?url=${encodedUrl}&default=${encodeURIComponent(fallbackImage)}`;
    }
    
    return imageSrc;
  };
  
  const getFallbackImage = () => {
    const titleHash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackImages[titleHash % fallbackImages.length];
  };
  
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className="diagram-card overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300 border-border/50">
        <div 
          className="diagram-card-image cursor-pointer aspect-[4/3] relative bg-muted/50"
          onClick={onClick}
          role="button" 
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          
          {imageError && retryCount >= maxRetries && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 p-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-center text-muted-foreground">
                Unable to load image. Using alternative visualization.
              </p>
            </div>
          )}
          
          <motion.img
            src={getImageSrc()}
            alt={title}
            className="w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              console.log(`Image error for: ${imageSrc}`);
              (e.target as HTMLImageElement).onerror = null;
              
              if (retryCount < maxRetries) {
                retryWithProxy();
              } else {
                setImageError(true);
                setIsLoading(false);
              }
            }}
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
          
          {isGenerated && (
            <Badge className="absolute top-2 right-2 bg-primary/70 backdrop-blur-sm">
              AI Generated
            </Badge>
          )}
          
          <Badge className="absolute bottom-2 left-2 bg-background/80 text-foreground backdrop-blur-sm flex items-center gap-1 border-border/50">
            <FileType2 className="h-3 w-3" />
            Diagram
          </Badge>
        </div>
        
        <CardHeader className="p-3 pb-0">
          <CardTitle 
            className="text-base font-medium line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={onClick}
          >
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-3 pt-2 flex-grow">
          <div className="flex flex-wrap gap-1 mt-1">
            {filteredTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > filteredTags.length && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 h-5 opacity-70"
              >
                +{tags.length - filteredTags.length}
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            By {author}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${
              isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <HeartIcon
              className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
            />
          </Button>
          
          {sourceUrl && sourceUrl !== "#" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                window.open(sourceUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
