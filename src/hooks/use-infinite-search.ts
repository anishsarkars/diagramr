
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchGoogleImages } from '@/utils/googleSearch';
import { generateDiagramWithAI } from '@/utils/ai-image-generator';
import { toast } from 'sonner';
import { useSearchLimit } from '@/hooks/use-search-limit';

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
  pageSize = 12,
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
  
  const { incrementGenerationCount } = useSearchLimit();
  
  const cachedResults = useRef<Map<string, DiagramResult[]>>(new Map());
  const allResults = useRef<DiagramResult[]>([]);
  const currentSearchKey = useRef<string>('');
  
  const resetSearch = useCallback(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setSearchTerm('');
    allResults.current = [];
    currentSearchKey.current = '';
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
    currentSearchKey.current = `${mode}:${query}`;
    
    try {
      if (mode === 'search') {
        // Initial batch of results
        const searchResults = await searchGoogleImages(query, searchKey, searchId);
        
        // Sort results by relevance
        const queryTerms = query.toLowerCase().split(' ');
        searchResults.sort((a, b) => {
          const aRelevance = calculateRelevance(a, queryTerms);
          const bRelevance = calculateRelevance(b, queryTerms);
          return bRelevance - aRelevance;
        });
        
        allResults.current = searchResults;
        setResults(searchResults.slice(0, pageSize));
        setHasMore(searchResults.length > pageSize);
        
        toast.success(`Found ${searchResults.length} educational diagrams`);
        
        // Cache the key and fetch additional results in the background for "endless" scrolling
        cachedResults.current.set(currentSearchKey.current, searchResults);
        
        // Start fetching more results in the background for "endless" scrolling
        fetchAdditionalResults(query);
      } else {
        // Generate diagram with AI
        try {
          // Increment generation count
          await incrementGenerationCount();
          
          // Generate image with AI
          const result = await generateDiagramWithAI(query);
          
          if (result && result.imageUrl) {
            const generatedResults: DiagramResult[] = [{
              id: `ai-${Date.now()}`,
              title: `AI-Generated Diagram: ${query}`,
              imageSrc: result.imageUrl,
              author: 'Diagramr AI',
              authorUsername: 'diagramr_ai',
              tags: query.split(' ')
                .filter(w => w.length > 3)
                .map(w => w.toLowerCase()),
              sourceUrl: '#',
              isGenerated: true
            }];
            
            allResults.current = generatedResults;
            setResults(generatedResults);
            setHasMore(false);
            
            toast.success('Diagram generated successfully!');
          } else {
            toast.error('Failed to generate diagram. Please try a different prompt.');
            setResults([]);
            setHasMore(false);
          }
        } catch (err) {
          console.error('Generation error:', err);
          toast.error('Failed to generate diagram. Please try again.');
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
  }, [pageSize, searchKey, searchId, incrementGenerationCount]);
  
  // Function to fetch additional results in the background to create the illusion of endless scrolling
  const fetchAdditionalResults = async (query: string) => {
    try {
      // Try to fetch more results with alternative queries
      const enhancedQuery = `${query} diagram educational concept visualization`;
      const additionalResults = await searchGoogleImages(enhancedQuery, searchKey, searchId, 2);
      
      // Deduplicate results by URL to avoid showing the same image twice
      const existingUrls = new Set(allResults.current.map(r => r.imageSrc));
      const newResults = additionalResults.filter(r => !existingUrls.has(r.imageSrc));
      
      if (newResults.length > 0) {
        allResults.current = [...allResults.current, ...newResults];
        // Update the cache
        cachedResults.current.set(currentSearchKey.current, allResults.current);
        // Force hasMore to be true since we now have additional results
        setHasMore(true);
      }
    } catch (err) {
      console.error('Error fetching additional results:', err);
      // Silently fail on background fetch, user still has initial results
    }
  };
  
  // Helper function to calculate relevance score
  const calculateRelevance = (result: DiagramResult, queryTerms: string[]): number => {
    let score = 0;
    
    // Check title relevance
    const title = result.title.toLowerCase();
    queryTerms.forEach(term => {
      if (title.includes(term)) score += 3;
    });
    
    // Check tags relevance
    if (result.tags) {
      queryTerms.forEach(term => {
        if (result.tags?.some(tag => tag.includes(term))) score += 2;
      });
    }
    
    // Educational keywords boost
    const educationalKeywords = ['education', 'concept', 'diagram', 'study', 'learn', 'research'];
    educationalKeywords.forEach(keyword => {
      if (title.includes(keyword)) score += 1;
    });
    
    return score;
  };
  
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
      // If we're at the end of our results but still have a search term,
      // we set hasMore to false but could potentially trigger a new search with a modified query
      setHasMore(false);
      
      // If we're near the end, try to fetch more results
      if (endIndex >= allResults.current.length - pageSize && searchTerm) {
        fetchAdditionalResults(searchTerm);
      }
    }
  }, [isLoading, hasMore, page, pageSize, searchTerm]);
  
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
