
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

// This file exports a collection of common icons used throughout the application
export const Icons = {
  spinner: ({ className, ...props }: React.ComponentProps<typeof Loader>) => (
    <Loader
      className={cn("h-4 w-4 animate-spin", className)}
      {...props}
    />
  ),
};
