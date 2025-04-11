import { useState, useEffect, useCallback, useRef } from 'react';
import { searchDiagrams } from '@/utils/search-service';
import { searchGoogleImages } from '@/utils/googleSearch';
import { toast } from 'sonner';
import { useSearchLimit } from '@/hooks/use-search-limit';
import { useNavigate } from 'react-router-dom';

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
  loadMore: () => Promise<void>;
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
  const navigate = useNavigate();
  
  const allResults = useRef<DiagramResult[]>([]);
  const currentSearchKey = useRef<string>('');
  const isLoadingMore = useRef<boolean>(false);
  const knownImageUrls = useRef<Set<string>>(new Set());
  
  const resetSearch = useCallback(() => {
    setResults([]);
    setPage(1);
    setCurrentSearchPage(1);
    setHasMore(true);
    setSearchTerm('');
    setError(null);
    allResults.current = [];
    currentSearchKey.current = '';
    knownImageUrls.current = new Set();
  }, []);
  
  // Helper function to deduplicate results
  const deduplicateResults = useCallback((newResults: DiagramResult[]): DiagramResult[] => {
    const uniqueResults: DiagramResult[] = [];
    
    for (const result of newResults) {
      const normalizedUrl = result.imageSrc.split('?')[0]; // Remove query parameters
      
      if (!knownImageUrls.current.has(normalizedUrl)) {
        knownImageUrls.current.add(normalizedUrl);
        uniqueResults.push(result);
      }
    }
    
    return uniqueResults;
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
    knownImageUrls.current = new Set();
    
    try {
      console.log("Searching for images with query:", query);
      
      // Fetch initial batch of results
      const initialBatchPages = 3; // Increased from 2 to 3 to get more initial results
      let batchedResults: DiagramResult[] = [];
      
      // First page - primary importance
      const firstPageResults = await searchDiagrams(query, 1);
      console.log(`Got ${firstPageResults.length} search results from first page`);
      batchedResults = [...firstPageResults];
      
      // Add all first page image URLs to known set
      firstPageResults.forEach(result => {
        const normalizedUrl = result.imageSrc.split('?')[0];
        knownImageUrls.current.add(normalizedUrl);
      });
      
      // Fetch more pages for the initial batch
      for (let i = 2; i <= initialBatchPages; i++) {
        try {
          const nextPageResults = await searchDiagrams(query, i);
          
          // Add only non-duplicate results
          const uniqueResults = nextPageResults.filter(item => {
            const normalizedUrl = item.imageSrc.split('?')[0];
            if (!knownImageUrls.current.has(normalizedUrl)) {
              knownImageUrls.current.add(normalizedUrl);
              return true;
            }
            return false;
          });
          
          batchedResults = [...batchedResults, ...uniqueResults];
          console.log(`Total results after page ${i}: ${batchedResults.length}`);
        } catch (error) {
          console.error(`Error fetching page ${i}:`, error);
          // Continue with results we have so far
          break;
        }
      }
      
      // Sort results by relevance score
      const sortedResults = batchedResults.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        return scoreB - scoreA;
      });
      
      allResults.current = sortedResults;
      
      // Show initial batch of results up to pageSize
      const resultSlice = allResults.current.slice(0, pageSize);
      setResults(resultSlice);
      setHasMore(allResults.current.length > pageSize || initialBatchPages < 5); // Always show load more option if we haven't loaded all pages
      
      if (allResults.current.length > 0) {
        toast.success(`Found ${resultSlice.length} diagrams for "${query}"`);
        
        // Pre-fetch a few more pages in the background for faster "load more" experience
        fetchAdditionalPages(query, initialBatchPages + 1);
      } else {
        // Try direct Google search as fallback if search-service returns no results
        try {
          const fallbackResults = await searchGoogleImages(query);
          const uniqueFallbackResults = deduplicateResults(fallbackResults);
          
          if (uniqueFallbackResults.length > 0) {
            allResults.current = uniqueFallbackResults;
            setResults(uniqueFallbackResults.slice(0, pageSize));
            setHasMore(uniqueFallbackResults.length > pageSize);
            toast.success(`Found ${uniqueFallbackResults.length} diagrams for "${query}"`);
          } else {
            toast.info("No results found. Try a different search term or check your spelling.", {
              action: {
                label: "Home",
                onClick: () => navigate('/')
              }
            });
          }
        } catch (fallbackError) {
          console.error("Fallback search failed:", fallbackError);
          toast.error("Search failed. Please try again with a different term.", {
            action: {
              label: "Home",
              onClick: () => navigate('/')
            }
          });
        }
      }
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      
      if (err.message && err.message.includes('quota exceeded')) {
        toast.error("API quota issue. Trying with alternate sources...", {
          duration: 5000
        });
        
        try {
          const fallbackResults = await searchGoogleImages(query);
          const uniqueFallbackResults = deduplicateResults(fallbackResults);
          
          if (uniqueFallbackResults.length > 0) {
            allResults.current = uniqueFallbackResults;
            setResults(uniqueFallbackResults.slice(0, pageSize));
            setHasMore(uniqueFallbackResults.length > pageSize);
            setError(null);
            toast.success(`Found ${uniqueFallbackResults.length} diagrams using alternative source`);
          } else {
            setResults([]);
            toast.error('Could not find results with available APIs', {
              description: "Please try again later or try a different search term.",
              action: {
                label: "Home",
                onClick: () => navigate('/')
              }
            });
          }
        } catch (fallbackErr) {
          console.error('Fallback search failed:', fallbackErr);
          setResults([]);
          setHasMore(false);
          toast.error('All API sources exhausted', {
            description: "We're experiencing technical difficulties. Please try again later.",
            action: {
              label: "Home",
              onClick: () => navigate('/')
            }
          });
        }
      } else {
        toast.error('Search failed', {
          description: "Please try again or go back to home.",
          action: {
            label: "Home",
            onClick: () => navigate('/')
          }
        });
        setResults([]);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, deduplicateResults, navigate]);
  
  const fetchAdditionalPages = async (query: string, startPage: number) => {
    const maxAdditionalPages = 15; // Increased from 10 to 15 to get even more results
    if (startPage > maxAdditionalPages) return;
    
    try {
      const additionalResults = await searchDiagrams(query, startPage);
      
      if (additionalResults.length > 0) {
        console.log(`Got ${additionalResults.length} results for page ${startPage}`);
        
        // Add only unique results not already in our collection
        const uniqueNewResults = additionalResults.filter(result => {
          const normalizedUrl = result.imageSrc.split('?')[0];
          if (!knownImageUrls.current.has(normalizedUrl)) {
            knownImageUrls.current.add(normalizedUrl);
            return true;
          }
          return false;
        });
        
        if (uniqueNewResults.length > 0) {
          console.log(`Adding ${uniqueNewResults.length} new unique results from page ${startPage}`);
          
          // Merge new results with existing and resort
          allResults.current = [...allResults.current, ...uniqueNewResults].sort((a, b) => {
            const scoreA = a.relevanceScore || 0;
            const scoreB = b.relevanceScore || 0;
            return scoreB - scoreA;
          });
          
          setHasMore(true);
        }
        
        // Continue fetching additional pages in background
        fetchAdditionalPages(query, startPage + 1);
      } else {
        console.log(`No more results found for page ${startPage}`);
      }
    } catch (err) {
      console.error(`Error fetching page ${startPage}:`, err);
      // Don't show error to user for background fetches
    }
  };
  
  // Load more results function - updated to load more results
  const loadMore = useCallback(async () => {
    // If we're already loading or there are no more results, do nothing
    if (isLoading || isLoadingMore.current || !hasMore) {
      return;
    }
    
    // If we have more results in our current batch, just show more from there
    if (allResults.current.length > results.length) {
      console.log(`Loading more results from existing cache of ${allResults.current.length} results`);
      const nextBatchStart = results.length;
      const nextBatchSize = 20; // Load 20 more items at a time (increased from 8-10)
      const nextBatchEnd = nextBatchStart + nextBatchSize;
      const nextBatch = allResults.current.slice(nextBatchStart, nextBatchEnd);
      
      setResults(prevResults => [...prevResults, ...nextBatch]);
      setHasMore(nextBatchEnd < allResults.current.length || currentSearchPage < 15); // Always allow loading more if we haven't reached max pages
      return;
    }
    
    // Otherwise, fetch new results
    isLoadingMore.current = true;
    setIsLoading(true);
    
    try {
      setCurrentSearchPage(prevPage => prevPage + 1);
      
      const newResults = await searchDiagrams(searchTerm, currentSearchPage + 1);
      
      if (newResults.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        isLoadingMore.current = false;
        return;
      }
      
      // Deduplicate new results
      const uniqueNewResults = deduplicateResults(newResults);
      
      // If we got unique results, add them
      if (uniqueNewResults.length > 0) {
        // Add to all results reference
        allResults.current = [...allResults.current, ...uniqueNewResults];
        
        // Update visible results - show up to 20 new results
        setResults(prevResults => [...prevResults, ...uniqueNewResults.slice(0, 20)]);
        
        // Always allow more loading unless we've reached the maximum page
        setHasMore(currentSearchPage + 1 < 15);
      } else if (currentSearchPage + 1 >= 15) {
        setHasMore(false);
      }
      
    } catch (err) {
      console.error('Error loading more results:', err);
      setError(err instanceof Error ? err : new Error('Failed to load more results'));
      toast.error('Failed to load more results');
    } finally {
      setIsLoading(false);
      isLoadingMore.current = false;
    }
  }, [
    isLoading, 
    hasMore, 
    results.length, 
    allResults.current.length, 
    searchTerm, 
    currentSearchPage, 
    deduplicateResults
  ]);
  
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
