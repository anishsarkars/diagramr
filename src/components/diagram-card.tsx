
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ImageEnlargeModal } from "./image-enlarge-modal";

interface DiagramCardProps {
  id: string | number;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
  isLiked?: boolean;
  onLike?: () => void;
  mode?: "grid" | "list";
  onTagClick?: (tag: string) => void;
  className?: string;
}

export function DiagramCard({
  id,
  title,
  imageSrc,
  author,
  authorUsername,
  tags = [],
  sourceUrl,
  isLiked = false,
  onLike,
  mode = "grid",
  onTagClick,
  className,
}: DiagramCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden transition-all border border-border/40 hover:border-primary/20 hover:shadow-md bg-card/50 backdrop-blur-sm",
          {
            "h-full": mode === "grid",
            "flex flex-row": mode === "list",
          },
          className
        )}
      >
        <div
          className={cn("relative overflow-hidden bg-muted/30", {
            "aspect-[4/3]": mode === "grid",
            "w-44 h-auto": mode === "list",
          })}
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-black/0 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2",
              {
                "p-3": mode === "grid",
                "p-2": mode === "list",
              }
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              onClick={() => setShowEnlargeModal(true)}
            >
              <Maximize className="h-4 w-4" />
            </Button>
            
            {sourceUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
                onClick={() => window.open(sourceUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>

          <img
            src={imageSrc}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              {
                "opacity-0": !isImageLoaded,
                "opacity-100": isImageLoaded,
              }
            )}
            onLoad={handleImageLoad}
            onClick={() => setShowEnlargeModal(true)}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div
          className={cn("flex flex-col", {
            "flex-1": mode === "list",
          })}
        >
          <CardHeader
            className={cn("p-3 pb-0", {
              "p-4 pb-2": mode === "list",
            })}
          >
            <div className="flex justify-between items-start gap-2">
              <h3
                className={cn("font-medium leading-tight line-clamp-2", {
                  "text-sm": mode === "grid",
                  "text-base": mode === "list",
                })}
              >
                {title}
              </h3>
              
              {onLike && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full -mt-1 -mr-1",
                    isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike();
                  }}
                >
                  <Heart
                    className={cn("h-4 w-4", {
                      "fill-red-500": isLiked,
                    })}
                  />
                </Button>
              )}
            </div>
            
            {author && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                By {author}
              </p>
            )}
          </CardHeader>

          {tags && tags.length > 0 && (
            <CardFooter
              className={cn("p-3 pt-2 flex flex-wrap gap-1", {
                "p-4 pt-2": mode === "list",
              })}
            >
              {tags.slice(0, mode === "grid" ? 2 : 5).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 font-normal bg-secondary/40 hover:bg-secondary cursor-pointer"
                  onClick={() => onTagClick && onTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > (mode === "grid" ? 2 : 5) && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 font-normal bg-secondary/40"
                >
                  +{tags.length - (mode === "grid" ? 2 : 5)}
                </Badge>
              )}
            </CardFooter>
          )}
        </div>
      </Card>

      <ImageEnlargeModal
        open={showEnlargeModal}
        onOpenChange={setShowEnlargeModal}
        image={
          showEnlargeModal
            ? {
                src: imageSrc,
                title: title,
                author: author,
                sourceUrl: sourceUrl
              }
            : null
        }
      />
    </>
  );
}
