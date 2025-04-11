
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  buttonText?: string;
}

export function SearchBox({ 
  onSearch, 
  placeholder = "What diagrams are you looking for?",
  buttonText = "Search"
}: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-20 py-6 text-base rounded-xl bg-background/90 backdrop-blur-sm border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white rounded-lg px-4"
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
