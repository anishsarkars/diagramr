
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResult } from "@/hooks/use-infinite-search";
import { ArrowDown, Send, Image, ThumbsUp, ThumbsDown, Maximize2, Download, Copy, Share, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  results?: SearchResult[];
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatBubbleProps {
  message: ChatMessage;
  onLike?: (id: string | number) => Promise<void>;
  likedDiagrams?: Set<string>;
  onSearch?: (query: string) => void;
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-end gap-3">
        <div className="bg-primary/10 text-foreground rounded-2xl rounded-br-sm px-4 py-2 max-w-[85%]">
          <p className="text-sm">{message.content}</p>
        </div>
        <Avatar className="h-8 w-8 border border-border/30">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

function AssistantMessage({ message, onLike, likedDiagrams, onSearch }: ChatBubbleProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  
  if (message.isLoading) {
    return (
      <div className="flex mb-4">
        <div className="flex items-end gap-3">
          <Avatar className="h-8 w-8 border border-border/30">
            <AvatarImage src="/lovable-uploads/2ee79d1b-aebe-44fc-9bd6-32cd8324499c.png" alt="Diagramr AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Searching for diagrams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!message.results || message.results.length === 0) {
    return (
      <div className="flex mb-4">
        <div className="flex items-end gap-3">
          <Avatar className="h-8 w-8 border border-border/30">
            <AvatarImage src="/lovable-uploads/2ee79d1b-aebe-44fc-9bd6-32cd8324499c.png" alt="Diagramr AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="bg-muted/50 text-foreground rounded-2xl rounded-bl-sm px-4 py-2 max-w-[85%]">
            <p className="text-sm">{message.content || "I couldn't find any diagrams for your search. Try a different query or browse our popular categories."}</p>
            {onSearch && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => onSearch("biology diagrams")}
                >
                  Try "biology diagrams"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => onSearch("computer science diagrams")}
                >
                  Try "computer science"
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-6">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 border border-border/30">
          <AvatarImage src="/lovable-uploads/2ee79d1b-aebe-44fc-9bd6-32cd8324499c.png" alt="Diagramr AI" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="space-y-2 max-w-[90%]">
          <div className="bg-muted/50 text-foreground rounded-2xl rounded-bl-sm px-4 py-3">
            <p className="text-sm mb-2">{message.content || `Here are some diagrams for "${message.results[0].searchTerm}"`}</p>
            
            <div className="grid grid-cols-1 gap-3 mt-3">
              {message.results.slice(0, 4).map((result) => (
                <div 
                  key={result.id}
                  className="rounded-lg overflow-hidden border border-border/30 bg-card/50 hover:bg-card transition-colors"
                >
                  <div 
                    className={cn(
                      "relative overflow-hidden cursor-pointer",
                      expandedResult === result.id.toString() ? "aspect-video" : "aspect-[4/2]"
                    )}
                    onClick={() => setExpandedResult(expandedResult === result.id.toString() ? null : result.id.toString())}
                  >
                    <img 
                      src={result.imageSrc} 
                      alt={result.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <button 
                      className="absolute bottom-2 right-2 p-1 rounded-full bg-background/90 hover:bg-background text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedResult(expandedResult === result.id.toString() ? null : result.id.toString());
                      }}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{result.title}</h3>
                    {expandedResult === result.id.toString() && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        {result.description && (
                          <p className="text-xs text-muted-foreground mb-2">{result.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {result.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-muted rounded-full text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-muted-foreground truncate">
                        {result.author || "Diagramr"}
                      </div>
                      <div className="flex gap-1">
                        {onLike && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7 rounded-full",
                              likedDiagrams?.has(result.id.toString()) && "text-rose-500"
                            )}
                            onClick={() => onLike(result.id)}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => {
                            // Open in new tab
                            window.open(result.sourceUrl || result.imageSrc, '_blank');
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {message.results.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs mt-2 w-full"
              >
                Show more results <ArrowDown className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <ThumbsDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <Share className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  onSearch: (query: string) => Promise<void>;
  searchResults: SearchResult[];
  searchTerm: string | null;
  isLoading: boolean;
  onLike?: (id: string | number) => Promise<void>;
  likedDiagrams?: Set<string>;
}

export function ChatInterface({ 
  onSearch, 
  searchResults, 
  searchTerm, 
  isLoading, 
  onLike, 
  likedDiagrams 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  // Generate welcome message on first visit
  useEffect(() => {
    if (isFirstVisit) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "there";
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "assistant",
        content: `Hi ${userName}! Welcome to Diagramr. I can help you find educational diagrams. What would you like to search for today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsFirstVisit(false);
      
      // Focus the input field
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    }
  }, [isFirstVisit, user]);
  
  // Update messages when search results change
  useEffect(() => {
    if (searchTerm && (searchResults.length > 0 || !isLoading)) {
      // Find if we already have a loading message for this search
      const loadingMsgIndex = messages.findIndex(
        msg => msg.isLoading && msg.content === `Searching for "${searchTerm}"...`
      );
      
      if (loadingMsgIndex !== -1) {
        // Replace loading message with results
        const updatedMessages = [...messages];
        updatedMessages[loadingMsgIndex] = {
          id: `result-${Date.now()}`,
          type: "assistant",
          content: searchResults.length 
            ? `Here are some diagrams for "${searchTerm}"`
            : `I couldn't find any diagrams for "${searchTerm}". Try a different query or browse our popular categories.`,
          results: searchResults,
          timestamp: new Date(),
          isLoading: false
        };
        setMessages(updatedMessages);
      } else if (messages.every(msg => !(msg.content.includes(searchTerm) && msg.type === "assistant"))) {
        // Add new message with results if we don't have one for this search term already
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `result-${Date.now()}`,
            type: "assistant",
            content: searchResults.length 
              ? `Here are some diagrams for "${searchTerm}"`
              : `I couldn't find any diagrams for "${searchTerm}". Try a different query or browse our popular categories.`,
            results: searchResults,
            timestamp: new Date(),
          }
        ]);
      }
    }
  }, [searchResults, searchTerm, isLoading, messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    // Add loading message from assistant
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      type: "assistant",
      content: `Searching for "${inputValue}"...`,
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage, loadingMessage]);
    setInputValue("");
    
    try {
      await onSearch(inputValue);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("There was an error with your search. Please try again.");
      
      // Update loading message to error
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isLoading && msg.content === `Searching for "${inputValue}"...`
            ? {
                ...msg,
                content: "Sorry, I couldn't complete the search. Please try again.",
                isLoading: false
              }
            : msg
        )
      );
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const suggestedQueries = [
    "Show me human anatomy diagrams",
    "Find circuit diagrams for Arduino",
    "UML diagram for e-commerce",
    "Biology cell structure diagrams"
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.type === "user" ? (
                  <UserMessage message={message} />
                ) : (
                  <AssistantMessage 
                    message={message} 
                    onLike={onLike}
                    likedDiagrams={likedDiagrams}
                    onSearch={onSearch}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-4 mb-8"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Try asking for:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-sm px-3 py-2 h-auto text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setInputValue(query);
                      setTimeout(() => handleSearch(), 100);
                    }}
                  >
                    <span className="truncate">{query}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-border/20 p-4 bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask about diagrams or type a search query..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10 py-6 border-border/30 focus:border-primary/30 rounded-xl bg-background shadow-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={handleSearch}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
