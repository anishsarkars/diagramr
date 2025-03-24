
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchDiagrams } from '@/utils/search-service';
import { searchGoogleImages } from '@/utils/googleSearch';
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
  relevanceScore?: number;
}

export function useInfiniteSearch({
  initialQuery = '',
  pageSize = 20
}: {
  initialQuery?: string;
  pageSize?: number;
} = {}): {
  results: DiagramResult[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  searchTerm: string;
  searchFor: (query: string) => Promise<void>;
  resetSearch: () => void;
} {
  const [results, setResults] = useState<DiagramResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  
  const { incrementCount } = useSearchLimit();
  
  const allResults = useRef<DiagramResult[]>([]);
  const currentSearchKey = useRef<string>('');
  const isLoadingMore = useRef<boolean>(false);
  
  const resetSearch = useCallback(() => {
    setResults([]);
    setPage(1);
    setCurrentSearchPage(1);
    setHasMore(true);
    setSearchTerm('');
    setError(null);
    allResults.current = [];
    currentSearchKey.current = '';
  }, []);
  
  const searchFor = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    console.log(`Starting search for query: "${query}"`);
    setIsLoading(true);
    setError(null);
    setSearchTerm(query);
    setResults([]);
    setPage(1);
    setCurrentSearchPage(1);
    allResults.current = [];
    currentSearchKey.current = `search:${query}`;
    
    try {
      console.log("Searching for diagrams with query:", query);
      
      // Direct Google search with the query
      console.log("Fetching search results using Google Custom Search API");
      const searchResults = await searchGoogleImages(query);
      
      console.log(`Got ${searchResults.length} search results`);
      
      allResults.current = searchResults;
      setResults(searchResults.slice(0, pageSize));
      setHasMore(searchResults.length > pageSize || currentSearchPage < 5);
      
      if (searchResults.length > 0) {
        toast.success(`Found ${searchResults.length} diagrams for "${query}"`);
      } else {
        // If no results from primary search, try a fallback search with modified query
        console.log("No results found, trying fallback search...");
        let fallbackQuery = `${query} image diagram`;
        const fallbackResults = await searchGoogleImages(fallbackQuery);
        
        if (fallbackResults.length > 0) {
          console.log(`Got ${fallbackResults.length} results from fallback search`);
          allResults.current = fallbackResults;
          setResults(fallbackResults.slice(0, pageSize));
          setHasMore(fallbackResults.length > pageSize || currentSearchPage < 5);
          toast.success(`Found ${fallbackResults.length} diagrams for "${query}"`);
        } else {
          toast.info("No results found. Try a different search term.");
        }
      }
      
      // Try to fetch additional pages in the background
      if (allResults.current.length > 0) {
        fetchAdditionalPages(query, 2);
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      toast.error('Search failed. Please try again.');
      setResults([]);
      setHasMore(false);
      throw err; // Rethrow to handle API quota errors specifically
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);
  
  const fetchAdditionalPages = async (query: string, startPage: number) => {
    const maxInitialPages = 5;
    if (startPage > maxInitialPages) return;
    
    try {
      // Always fetch fresh results for additional pages
      console.log(`Fetching additional results for page ${startPage}`);
      const additionalResults = await searchGoogleImages(query, undefined, undefined, startPage);
      
      if (additionalResults.length > 0) {
        console.log(`Got ${additionalResults.length} results for page ${startPage}`);
        
        const existingUrls = new Set(allResults.current.map(r => r.imageSrc));
        const newResults = additionalResults.filter(r => !existingUrls.has(r.imageSrc));
        
        if (newResults.length > 0) {
          console.log(`Adding ${newResults.length} new unique results from page ${startPage}`);
          allResults.current = [...allResults.current, ...newResults];
          setHasMore(true);
        }
        
        fetchAdditionalPages(query, startPage + 1);
      } else {
        console.log(`No more results found for page ${startPage}`);
      }
    } catch (err) {
      console.error(`Error fetching page ${startPage}:`, err);
    }
  };
  
  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore.current || !hasMore) return;
    
    console.log("Loading more results...");
    isLoadingMore.current = true;
    
    try {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      if (endIndex < allResults.current.length) {
        console.log(`Loading more results from memory (${startIndex}-${endIndex})`);
        setResults(prev => [...prev, ...allResults.current.slice(startIndex, endIndex)]);
        setPage(nextPage);
        setHasMore(allResults.current.length > endIndex);
      } else {
        const nextSearchPage = currentSearchPage + 1;
        console.log(`Need to fetch more results for page ${nextSearchPage}`);
        
        // Always fetch fresh results
        console.log(`Fetching new page ${nextSearchPage} for ${searchTerm}`);
        const newPageResults = await searchGoogleImages(searchTerm, undefined, undefined, nextSearchPage);
        
        const existingUrls = new Set(results.map(r => r.imageSrc));
        const uniqueNewResults = newPageResults.filter(r => !existingUrls.has(r.imageSrc));
        
        if (uniqueNewResults.length > 0) {
          console.log(`Adding ${uniqueNewResults.length} new unique results to display`);
          allResults.current = [...allResults.current, ...uniqueNewResults];
          setResults(prev => [...prev, ...uniqueNewResults]);
          setHasMore(uniqueNewResults.length >= 5);
          setCurrentSearchPage(nextSearchPage);
          
          fetchAdditionalPages(searchTerm, nextSearchPage + 1);
        } else {
          console.log("No new unique results found");
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more results:", error);
      setHasMore(false);
      
      if (error.message === 'API quota exceeded') {
        setError(new Error('API quota exceeded'));
        toast.error("We've hit our API quota limit. Please try again later.");
      }
    } finally {
      isLoadingMore.current = false;
    }
  }, [isLoading, hasMore, page, pageSize, searchTerm, results, currentSearchPage]);
  
  useEffect(() => {
    if (initialQuery) {
      searchFor(initialQuery);
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
    resetSearch
  };
}
