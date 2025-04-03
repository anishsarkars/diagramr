
import { useState } from "react";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export function FeedbackButton() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<"issue" | "feature" | "other">("other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Skip on auth page
  if (location.pathname === "/auth") return null;
  
  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter feedback message");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would connect to your feedback API
      const response = await fetch("https://api.example.com/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          email: email || (user ? user.email : "anonymous"),
          type: feedbackType,
          path: location.pathname,
          userId: user ? user.id : "anonymous",
        }),
      });
      
      // Mock API call successful response
      setMessage("");
      setEmail("");
      setFeedbackType("other");
      setIsOpen(false);
      
      toast.success("Feedback submitted", {
        description: "Thank you for helping us improve!",
      });
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.success("Feedback received", { 
        description: "Thanks for your feedback!" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-5 right-5 z-40 h-10 w-10 rounded-full bg-primary/10 border-primary/20 shadow-md hover:shadow-lg transition-all"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>Send Feedback</SheetTitle>
          <SheetDescription>
            Help us improve Diagramr by sharing your experience or suggestions
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge 
                variant={feedbackType === "issue" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFeedbackType("issue")}
              >
                Issue
              </Badge>
              <Badge 
                variant={feedbackType === "feature" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFeedbackType("feature")}
              >
                Feature Request
              </Badge>
              <Badge 
                variant={feedbackType === "other" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFeedbackType("other")}
              >
                Other
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="What's on your mind? Share your thoughts, suggestions, or issues you've experienced..."
              className="min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          {!user && (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? "Sending..." : "Submit Feedback"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
