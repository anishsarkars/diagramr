
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Edit } from "lucide-react";

interface DiagramCardProps {
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  className?: string;
  aspectRatio?: number;
}

export function DiagramCard({
  title,
  imageSrc,
  author,
  authorUsername,
  tags = [],
  className,
  aspectRatio = 16 / 9,
}: DiagramCardProps) {
  return (
    <div className={cn("diagram-card group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md", className)}>
      <div className="diagram-card-image relative">
        <AspectRatio ratio={aspectRatio}>
          <img
            src={imageSrc}
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </AspectRatio>
        {author && (
          <div className="absolute bottom-2 right-2 text-xs">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              @{authorUsername || author.toLowerCase()}
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <Button size="sm" variant="secondary" className="gap-1">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
          <Button size="sm" variant="secondary" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
