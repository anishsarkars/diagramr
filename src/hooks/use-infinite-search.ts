
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
  pageSize = 24 // Increased page size from 12 to 24
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
      console.log("Searching for images with query:", query);
      
      // Pre-fetch multiple pages at once to get more results upfront
      // Increase the initial batch pages to get more results
      const initialBatchPages = 5; // Increased from 3 to 5
      let batchedResults: DiagramResult[] = [];
      
      // Get first page
      const firstPageResults = await searchDiagrams(query, 1);
      console.log(`Got ${firstPageResults.length} search results from first page`);
      batchedResults = [...firstPageResults];
      
      // Start preloading additional pages in parallel
      const additionalPagesPromises = [];
      for (let p = 2; p <= initialBatchPages; p++) {
        additionalPagesPromises.push(searchDiagrams(query, p));
      }
      
      // Wait for all additional page requests to complete
      const additionalPagesResults = await Promise.allSettled(additionalPagesPromises);
      
      // Process resolved promises and add to results
      additionalPagesResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          console.log(`Got ${result.value.length} search results from page ${index + 2}`);
          batchedResults = [...batchedResults, ...result.value];
        }
      });
      
      // Filter out duplicates by URL
      const uniqueUrls = new Set();
      const uniqueResults = batchedResults.filter(item => {
        if (!uniqueUrls.has(item.imageSrc)) {
          uniqueUrls.add(item.imageSrc);
          return true;
        }
        return false;
      });
      
      // Combine and sort results by relevance
      allResults.current = uniqueResults.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        return scoreB - scoreA;
      });
      
      setResults(allResults.current.slice(0, pageSize));
      setHasMore(allResults.current.length > pageSize);
      
      if (allResults.current.length > 0) {
        toast.success(`Found ${allResults.current.length} diagrams for "${query}"`);
      } else {
        // If no results, try with fallback search
        const fallbackResults = await searchGoogleImages(query);
        if (fallbackResults.length > 0) {
          allResults.current = fallbackResults;
          setResults(fallbackResults.slice(0, pageSize));
          setHasMore(fallbackResults.length > pageSize);
          toast.success(`Found ${fallbackResults.length} images for "${query}"`);
        } else {
          toast.info("No results found. Try a different search term.");
        }
      }
      
      // Try to fetch additional pages in the background for even more results
      if (allResults.current.length > 0) {
        fetchAdditionalPages(query, initialBatchPages + 1);
      }
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      
      if (err.message && err.message.includes('quota exceeded')) {
        toast.error("API quota issue. Trying with alternate sources...", {
          duration: 3000
        });
        
        // Try one more time with a different search method
        try {
          // Direct search without using an API key (system will rotate)
          const fallbackResults = await searchGoogleImages(query);
          if (fallbackResults.length > 0) {
            allResults.current = fallbackResults;
            setResults(fallbackResults.slice(0, pageSize));
            setHasMore(fallbackResults.length > pageSize);
            setError(null);
            toast.success(`Found ${fallbackResults.length} images using alternative source`);
          } else {
            setResults([]);
            toast.error('Could not find results with available APIs. Please try again later.');
          }
        } catch (fallbackErr) {
          console.error('Fallback search failed:', fallbackErr);
          setResults([]);
          setHasMore(false);
          toast.error('All API sources exhausted. Please try again later.');
        }
      } else {
        toast.error('Search failed. Please try again.');
        setResults([]);
        setHasMore(false);
      }
      
      throw err; // Rethrow to handle in the component
      
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);
  
  const fetchAdditionalPages = async (query: string, startPage: number) => {
    // Increase the max additional pages to get more results
    const maxAdditionalPages = 8; // Increased from 5 to 8
    if (startPage > maxAdditionalPages) return;
    
    try {
      // Get more results from next page
      console.log(`Fetching additional results for page ${startPage}`);
      
      const additionalResults = await searchDiagrams(query, startPage);
      
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
      // Don't set an error state here, just log it
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
        
        try {
          // The searchDiagrams function handles API rotation internally
          const newPageResults = await searchDiagrams(searchTerm, nextSearchPage);
          
          const existingUrls = new Set(results.map(r => r.imageSrc));
          const uniqueNewResults = newPageResults.filter(r => !existingUrls.has(r.imageSrc));
          
          if (uniqueNewResults.length > 0) {
            console.log(`Adding ${uniqueNewResults.length} new unique results to display`);
            allResults.current = [...allResults.current, ...uniqueNewResults];
            setResults(prev => [...prev, ...uniqueNewResults]);
            setHasMore(uniqueNewResults.length >= 5);
            setCurrentSearchPage(nextSearchPage);
          } else {
            // If no unique new results from main source, try with Google Images
            const fallbackResults = await searchGoogleImages(`${searchTerm} diagram`, nextSearchPage);
            const uniqueFallbackResults = fallbackResults.filter(r => !existingUrls.has(r.imageSrc));
            
            if (uniqueFallbackResults.length > 0) {
              console.log(`Adding ${uniqueFallbackResults.length} new unique results from fallback source`);
              allResults.current = [...allResults.current, ...uniqueFallbackResults];
              setResults(prev => [...prev, ...uniqueFallbackResults]);
              setHasMore(uniqueFallbackResults.length >= 5);
            } else {
              console.log("No new unique results found from either source");
              setHasMore(false);
            }
          }
        } catch (error: any) {
          console.error("Error loading more results:", error);
          
          if (error.message && error.message.includes('quota exceeded')) {
            toast.error("Reached API limits. Try again later.", { duration: 3000 });
          }
          
          // Try with fallback source even if there's an error
          try {
            const fallbackResults = await searchGoogleImages(`${searchTerm} diagram`, nextSearchPage);
            const existingUrls = new Set(results.map(r => r.imageSrc));
            const uniqueFallbackResults = fallbackResults.filter(r => !existingUrls.has(r.imageSrc));
            
            if (uniqueFallbackResults.length > 0) {
              console.log(`Adding ${uniqueFallbackResults.length} new unique results from fallback after error`);
              allResults.current = [...allResults.current, ...uniqueFallbackResults];
              setResults(prev => [...prev, ...uniqueFallbackResults]);
              setHasMore(uniqueFallbackResults.length >= 5);
            } else {
              setHasMore(false);
            }
          } catch (fallbackError) {
            console.error("Fallback search also failed:", fallbackError);
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error("Error loading more results:", error);
      setHasMore(false);
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
