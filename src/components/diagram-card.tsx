
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
import { HeartIcon, Sparkles, ExternalLinkIcon } from "lucide-react";
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
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="diagram-card overflow-hidden h-full flex flex-col">
        <div 
          className="diagram-card-image cursor-pointer"
          onClick={onClick}
          role="button" 
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        >
          <motion.img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover aspect-[4/3]"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png";
            }}
          />
          {isGenerated && (
            <Badge className="absolute top-2 right-2 bg-primary/70 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          )}
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
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 h-5 opacity-70"
              >
                +{tags.length - 3}
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
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
