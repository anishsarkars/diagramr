
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchGoogleImages } from '@/utils/googleSearch';
import { generateDiagramWithGemini } from '@/utils/geminiImageGenerator';
import { toast } from 'sonner';

export interface DiagramResult {
  id: string | number;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
  isGenerated?: boolean;
}

interface UseInfiniteSearchOptions {
  initialQuery?: string;
  pageSize?: number;
  searchKey?: string;
  searchId?: string;
}

interface UseInfiniteSearchResult {
  results: DiagramResult[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  searchTerm: string;
  searchFor: (query: string, mode: 'search' | 'generate') => Promise<void>;
  lastAction: 'search' | 'generate';
  resetSearch: () => void;
}

export function useInfiniteSearch({
  initialQuery = '',
  pageSize = 8,
  searchKey = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchId = "260090575ae504419"
}: UseInfiniteSearchOptions = {}): UseInfiniteSearchResult {
  const [results, setResults] = useState<DiagramResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [lastAction, setLastAction] = useState<'search' | 'generate'>('search');
  
  const cachedResults = useRef<Map<string, DiagramResult[]>>(new Map());
  const allResults = useRef<DiagramResult[]>([]);
  
  const resetSearch = useCallback(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setSearchTerm('');
    allResults.current = [];
  }, []);
  
  const searchFor = useCallback(async (query: string, mode: 'search' | 'generate') => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchTerm(query);
    setLastAction(mode);
    setResults([]);
    setPage(1);
    allResults.current = [];
    
    try {
      if (mode === 'search') {
        // Check if we have cached results
        const cacheKey = `search:${query}`;
        let searchResults: DiagramResult[];
        
        if (cachedResults.current.has(cacheKey)) {
          searchResults = cachedResults.current.get(cacheKey) || [];
        } else {
          searchResults = await searchGoogleImages(query, searchKey, searchId);
          cachedResults.current.set(cacheKey, searchResults);
        }
        
        allResults.current = searchResults;
        setResults(searchResults.slice(0, pageSize));
        setHasMore(searchResults.length > pageSize);
        
        toast.success(`Found ${searchResults.length} educational diagrams`);
      } else {
        const result = await generateDiagramWithGemini({ prompt: query });
        
        if (result) {
          // If the result is a URL
          if (result.startsWith('http')) {
            const generatedResults: DiagramResult[] = [{
              id: `gemini-${Date.now()}`,
              title: `AI-Generated Diagram: ${query}`,
              imageSrc: result,
              author: 'Diagramr AI',
              authorUsername: 'diagramr_ai',
              tags: query.split(' ').filter(w => w.length > 3).map(w => w.toLowerCase()),
              sourceUrl: '#',
              isGenerated: true
            }];
            
            allResults.current = generatedResults;
            setResults(generatedResults);
            setHasMore(false);
          } else {
            // If the result is text, we need to extract information from it
            // For now, just show an error
            toast.error('Generated content is not an image. Please try a different prompt.');
            setResults([]);
            setHasMore(false);
          }
        } else {
          toast.error('Failed to generate diagram');
          setResults([]);
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, searchKey, searchId]);
  
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const nextResults = allResults.current.slice(startIndex, endIndex);
    
    if (nextResults.length > 0) {
      setResults(prev => [...prev, ...nextResults]);
      setPage(nextPage);
      setHasMore(endIndex < allResults.current.length);
    } else {
      setHasMore(false);
    }
  }, [isLoading, hasMore, page, pageSize]);
  
  useEffect(() => {
    if (initialQuery) {
      searchFor(initialQuery, 'search');
    }
  }, [initialQuery, searchFor]);
  
  return {
    results,
    isLoading,
    error,
    hasMore,
    loadMore,
    searchTerm,
    searchFor,
    lastAction,
    resetSearch
  };
}
