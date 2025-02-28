
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, SendIcon } from "lucide-react";

interface AIInputProps {
  className?: string;
  onSubmit?: (prompt: string) => void;
}

export function AIInput({ className, onSubmit }: AIInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (onSubmit && prompt.trim()) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 h-8 w-8 rounded-full"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Input
        type="text"
        placeholder="Ask about diagrams or request AI to generate one..."
        className="pl-12 pr-14 py-6 text-base w-full bg-background/80 backdrop-blur-sm border-border"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        size="icon"
        className="absolute right-2 h-8 w-8 rounded-full bg-primary"
        onClick={handleSubmit}
        disabled={!prompt.trim()}
      >
        <SendIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
