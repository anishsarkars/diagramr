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
  pageSize = 15 
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
      
      // Reduce initial batch pages to limit results to 15-20 items
      const initialBatchPages = 2; // Fetch only 2 pages initially (about 15-20 results)
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
      
      // Only fetch second page if we need more results to meet the 15-20 target
      if (batchedResults.length < 15) {
        console.log("Fetching second page to reach target result count");
        try {
          const secondPageResults = await searchDiagrams(query, 2);
          
          // Add only non-duplicate results
          const uniqueResults = secondPageResults.filter(item => {
            const normalizedUrl = item.imageSrc.split('?')[0];
            if (!knownImageUrls.current.has(normalizedUrl)) {
              knownImageUrls.current.add(normalizedUrl);
              return true;
            }
            return false;
          });
          
          batchedResults = [...batchedResults, ...uniqueResults];
          console.log(`Total results after second page: ${batchedResults.length}`);
        } catch (error) {
          console.error("Error fetching second page:", error);
          // Continue with just first page results
        }
      }
      
      // Sort results by relevance score
      const sortedResults = batchedResults.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        return scoreB - scoreA;
      });
      
      allResults.current = sortedResults;
      
      // Limit the number of results to pageSize (15-20)
      const resultSlice = allResults.current.slice(0, pageSize);
      setResults(resultSlice);
      setHasMore(allResults.current.length > pageSize);
      
      if (allResults.current.length > 0) {
        toast.success(`Found ${Math.min(allResults.current.length, pageSize)} diagrams for "${query}"`);
        
        // Don't automatically load more in the background
        // This is removed to prevent loading too many results
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
    const maxAdditionalPages = 10; // Increased from 8 to 10 to get more results
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
  
  // Load more results function
  const loadMore = useCallback(async () => {
    // If we're already loading or there are no more results, do nothing
    if (isLoading || isLoadingMore.current || !hasMore) {
      return;
    }
    
    // If we have more results in our current batch, just show more from there
    if (allResults.current.length > results.length) {
      console.log(`Loading ${pageSize} more results from existing cache of ${allResults.current.length} results`);
      const nextBatchStart = results.length;
      const nextBatchEnd = nextBatchStart + pageSize;
      // Only load 8-10 more results at a time to maintain the smaller batches
      const nextBatch = allResults.current.slice(nextBatchStart, nextBatchStart + 8);
      
      setResults(prevResults => [...prevResults, ...nextBatch]);
      setHasMore(nextBatchEnd < allResults.current.length);
      return;
    }
    
    // Otherwise, fetch new results
    isLoadingMore.current = true;
    
    try {
      setCurrentSearchPage(prevPage => prevPage + 1);
      
      const newResults = await searchDiagrams(searchTerm, currentSearchPage + 1);
      
      if (newResults.length === 0) {
        setHasMore(false);
        return;
      }
      
      // Deduplicate new results
      const uniqueNewResults = deduplicateResults(newResults);
      
      // Limit to just 8-10 new results
      const limitedNewResults = uniqueNewResults.slice(0, 8);
      
      // If we got unique results, add them
      if (limitedNewResults.length > 0) {
        // Add to all results reference
        allResults.current = [...allResults.current, ...limitedNewResults];
        
        // Update visible results
        setResults(prevResults => [...prevResults, ...limitedNewResults]);
        
        // If we didn't get the full requested batch, assume there are no more
        setHasMore(limitedNewResults.length >= 8);
      } else {
        setHasMore(false);
      }
      
    } catch (err) {
      console.error('Error loading more results:', err);
      setError(err instanceof Error ? err : new Error('Failed to load more results'));
      toast.error('Failed to load more results');
    } finally {
      isLoadingMore.current = false;
    }
  }, [
    isLoading, 
    hasMore, 
    results.length, 
    allResults.current.length, 
    pageSize, 
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
