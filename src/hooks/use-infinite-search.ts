
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchGoogleImages } from '@/utils/googleSearch';
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
  searchFor: (query: string, mode: 'search' | 'generate', generatedResults?: DiagramResult[]) => Promise<void>;
  lastAction: 'search' | 'generate';
  resetSearch: () => void;
}

export function useInfiniteSearch({
  initialQuery = '',
  pageSize = 20,
  searchKey = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchId = "260090575ae504419"
}: UseInfiniteSearchOptions = {}): UseInfiniteSearchResult {
  const [results, setResults] = useState<DiagramResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [lastAction, setLastAction] = useState<'search' | 'generate'>('search');
  
  const cachedResults = useRef<Map<string, DiagramResult[]>>(new Map());
  const allResults = useRef<DiagramResult[]>([]);
  const currentSearchKey = useRef<string>('');
  const isLoadingMore = useRef<boolean>(false);
  
  const resetSearch = useCallback(() => {
    setResults([]);
    setPage(1);
    setCurrentSearchPage(1);
    setHasMore(true);
    setSearchTerm('');
    allResults.current = [];
    currentSearchKey.current = '';
  }, []);
  
  const searchFor = useCallback(async (
    query: string, 
    mode: 'search' | 'generate',
    generatedResults?: DiagramResult[]
  ) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchTerm(query);
    setLastAction(mode);
    setResults([]);
    setPage(1);
    setCurrentSearchPage(1);
    allResults.current = [];
    currentSearchKey.current = `${mode}:${query}`;
    
    try {
      if (mode === 'search') {
        // Check if we have results in the cache
        const cacheKey = `diagramr-search-${query}-page-1`;
        const cachedData = sessionStorage.getItem(cacheKey);
        let searchResults: DiagramResult[] = [];
        
        if (cachedData) {
          // Use cached results if available
          console.log("Using cached search results");
          searchResults = JSON.parse(cachedData);
        } else {
          // Initial batch of results
          try {
            searchResults = await searchGoogleImages(query, searchKey, searchId);
            
            // Cache the results
            sessionStorage.setItem(cacheKey, JSON.stringify(searchResults));
          } catch (error) {
            console.error("Failed to fetch search results:", error);
            toast.error("Search failed. Please try a different query.");
            searchResults = [];
          }
        }
        
        // Sort results by relevance
        const queryTerms = query.toLowerCase().split(' ');
        searchResults.sort((a, b) => {
          const aRelevance = calculateRelevance(a, queryTerms);
          const bRelevance = calculateRelevance(b, queryTerms);
          return bRelevance - aRelevance;
        });
        
        allResults.current = searchResults;
        setResults(searchResults.slice(0, pageSize));
        setHasMore(searchResults.length > pageSize || currentSearchPage < 5); // Assume there are more pages
        
        // Cache the key and fetch additional results in the background for "endless" scrolling
        if (searchResults.length > 0) {
          toast.success(`Found ${searchResults.length} diagram results for "${query}"`);
          cachedResults.current.set(currentSearchKey.current, searchResults);
          
          // Start fetching more pages in the background
          fetchAdditionalPages(query, 2);
        }
      } else if (generatedResults && generatedResults.length > 0) {
        // Handle generated diagram from outside
        allResults.current = generatedResults;
        setResults(generatedResults);
        setHasMore(false);
      } else {
        // No generated results provided, show empty state
        allResults.current = [];
        setResults([]);
        setHasMore(false);
        toast.error("No diagrams generated. Please try again with a different prompt.");
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      toast.error('Search failed. Please try again.');
      setResults([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, searchKey, searchId]);
  
  // Function to fetch additional pages for endless scrolling
  const fetchAdditionalPages = async (query: string, startPage: number) => {
    // Don't fetch more than 5 pages initially
    const maxInitialPages = 5;
    if (startPage > maxInitialPages) return;
    
    try {
      const cacheKey = `diagramr-search-${query}-page-${startPage}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        console.log(`Using cached results for page ${startPage}`);
        const pageResults = JSON.parse(cachedData);
        // Merge with allResults.current, avoiding duplicates
        const existingUrls = new Set(allResults.current.map(r => r.imageSrc));
        const newResults = pageResults.filter((r: DiagramResult) => !existingUrls.has(r.imageSrc));
        
        if (newResults.length > 0) {
          allResults.current = [...allResults.current, ...newResults];
          setHasMore(true);
        }
        
        // Continue fetching next page in background
        fetchAdditionalPages(query, startPage + 1);
      } else {
        console.log(`Fetching additional results for page ${startPage}`);
        try {
          const additionalResults = await searchGoogleImages(query, searchKey, searchId, startPage);
          
          if (additionalResults && additionalResults.length > 0) {
            // Cache the results
            sessionStorage.setItem(cacheKey, JSON.stringify(additionalResults));
            
            // Deduplicate results by URL to avoid showing the same image twice
            const existingUrls = new Set(allResults.current.map(r => r.imageSrc));
            const newResults = additionalResults.filter(r => !existingUrls.has(r.imageSrc));
            
            if (newResults.length > 0) {
              allResults.current = [...allResults.current, ...newResults];
              setHasMore(true);
            }
            
            // Continue fetching next page in background
            fetchAdditionalPages(query, startPage + 1);
          } else {
            console.log(`No more results found for page ${startPage}`);
          }
        } catch (error) {
          console.error(`Error fetching page ${startPage}:`, error);
        }
      }
    } catch (err) {
      console.error(`Error fetching page ${startPage}:`, err);
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
    
    // Boost educational diagrams if the query includes educational terms
    const educationalTerms = ['education', 'learn', 'study', 'school', 'university', 'college', 'academic'];
    const isEducationalQuery = queryTerms.some(term => educationalTerms.includes(term));
    
    if (isEducationalQuery) {
      const educationalKeywords = ['education', 'concept', 'diagram', 'study', 'learn', 'research', 'course'];
      educationalKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
      });
    }
    
    // Boost professional diagrams if the query includes business/professional terms
    const professionalTerms = ['business', 'professional', 'company', 'corporate', 'enterprise', 'organization'];
    const isProfessionalQuery = queryTerms.some(term => professionalTerms.includes(term));
    
    if (isProfessionalQuery) {
      const professionalKeywords = ['business', 'workflow', 'process', 'strategy', 'management', 'organization'];
      professionalKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
      });
    }
    
    // General diagram keywords boost
    const diagramKeywords = ['diagram', 'flowchart', 'chart', 'visual', 'graphic', 'illustration', 'visualization'];
    diagramKeywords.forEach(keyword => {
      if (title.includes(keyword)) score += 1;
    });
    
    return score;
  };
  
  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore.current || !hasMore) return;
    
    isLoadingMore.current = true;
    
    try {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      if (endIndex < allResults.current.length) {
        // We have enough pre-loaded results
        setResults(prev => [...prev, ...allResults.current.slice(startIndex, endIndex)]);
        setPage(nextPage);
        setHasMore(allResults.current.length > endIndex);
      } else if (lastAction === 'search') {
        // Need to fetch more results
        const nextSearchPage = currentSearchPage + 1;
        
        // Check if we have this page cached in sessionStorage
        const cacheKey = `diagramr-search-${searchTerm}-page-${nextSearchPage}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        let newPageResults: DiagramResult[] = [];
        
        if (cachedData) {
          console.log(`Loading cached page ${nextSearchPage}`);
          newPageResults = JSON.parse(cachedData);
        } else {
          console.log(`Fetching new page ${nextSearchPage} for ${searchTerm}`);
          try {
            newPageResults = await searchGoogleImages(searchTerm, searchKey, searchId, nextSearchPage);
            
            // Cache for future use
            if (newPageResults.length > 0) {
              sessionStorage.setItem(cacheKey, JSON.stringify(newPageResults));
            }
          } catch (error) {
            console.error(`Error fetching page ${nextSearchPage}:`, error);
            newPageResults = [];
          }
        }
        
        // Deduplicate results
        const existingUrls = new Set(results.map(r => r.imageSrc));
        const uniqueNewResults = newPageResults.filter(r => !existingUrls.has(r.imageSrc));
        
        if (uniqueNewResults.length > 0) {
          // Merge with all results
          allResults.current = [...allResults.current, ...uniqueNewResults];
          
          // Update displayed results
          setResults(prev => [...prev, ...uniqueNewResults]);
          setHasMore(uniqueNewResults.length >= 5); // Assume more if we got a decent number
          setCurrentSearchPage(nextSearchPage);
          
          // Pre-fetch next page if we got results
          fetchAdditionalPages(searchTerm, nextSearchPage + 1);
        } else {
          // No more unique results
          setHasMore(false);
        }
      } else {
        // No more results for generation
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more results:", error);
      setHasMore(false);
    } finally {
      isLoadingMore.current = false;
    }
  }, [isLoading, hasMore, page, pageSize, searchTerm, results, lastAction, currentSearchPage, searchKey, searchId]);
  
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
