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
import { HeartIcon, ExternalLink, FileType2 } from "lucide-react";
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
  // Add state to track image loading errors and loading state
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const fallbackImage = "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png";
  
  // Filter tags to only keep diagram-relevant ones
  const filterRelevantTags = (tags: string[]) => {
    const diagramKeywords = [
      'diagram', 'chart', 'flow', 'architecture', 'model', 'uml', 'class',
      'entity', 'relationship', 'network', 'topology', 'database', 'schema',
      'sequence', 'structure', 'algorithm', 'visualization', 'system', 'design'
    ];
    
    return tags
      .filter(tag => 
        diagramKeywords.some(keyword => tag.toLowerCase().includes(keyword)) ||
        tag.length > 3
      )
      .slice(0, 4);
  };
  
  const filteredTags = filterRelevantTags(tags);
  
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
          
          <motion.img
            src={imageError ? fallbackImage : imageSrc}
            alt={title}
            className="w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              console.log(`Image error for: ${imageSrc}`);
              setImageError(true);
              setIsLoading(false);
              (e.target as HTMLImageElement).onerror = null;
            }}
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
          
          {isGenerated && (
            <Badge className="absolute top-2 right-2 bg-primary/70 backdrop-blur-sm">
              AI Generated
            </Badge>
          )}
          
          {/* Diagram indicator */}
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
