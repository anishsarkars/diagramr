
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

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
    <div className={cn("diagram-card group", className)}>
      <div className="diagram-card-image">
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
