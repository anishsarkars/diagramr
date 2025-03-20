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
  pageSize = 20,
  searchKey = "AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg",
  searchId = "260090575ae504419"
}: {
  initialQuery?: string;
  pageSize?: number;
  searchKey?: string;
  searchId?: string;
} = {}): {
  results: DiagramResult[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  searchTerm: string;
  searchFor: (query: string, mode: 'search' | 'generate') => Promise<void>;
  lastAction: 'search' | 'generate';
  resetSearch: () => void;
} {
  const [results, setResults] = useState<DiagramResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [lastAction, setLastAction] = useState<'search' | 'generate'>('search');
  
  const { incrementGenerationCount } = useSearchLimit();
  
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
  
  const searchFor = useCallback(async (query: string, mode: 'search' | 'generate') => {
    if (!query.trim()) return;
    
    console.log(`Starting ${mode} for query: "${query}"`);
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
        console.log("Searching for diagrams with query:", query);
        
        // Always fetch fresh results for better accuracy instead of using cache
        console.log("Fetching fresh search results");
        const searchResults = await searchGoogleImages(query, searchKey, searchId);
        
        console.log(`Got ${searchResults.length} search results`);
        
        // Sort results by relevance
        const queryTerms = query.toLowerCase().split(' ');
        searchResults.sort((a, b) => {
          const aRelevance = calculateRelevance(a, queryTerms);
          const bRelevance = calculateRelevance(b, queryTerms);
          return bRelevance - aRelevance;
        });
        
        allResults.current = searchResults;
        setResults(searchResults.slice(0, pageSize));
        setHasMore(searchResults.length > pageSize || currentSearchPage < 5);
        
        if (searchResults.length > 0) {
          toast.success(`Found ${searchResults.length} educational diagrams for "${query}"`);
        } else {
          toast.info("No results found. Try a different search term or try generating a diagram.");
        }
        
        cachedResults.current.set(currentSearchKey.current, searchResults);
        
        fetchAdditionalPages(query, 2);
      } else {
        console.log("Generating diagram for query:", query);
        try {
          await incrementGenerationCount();
          
          const result = await generateDiagramWithAI(query);
          console.log("Generation result:", result);
          
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
            console.error("Failed to generate diagram - no imageUrl in result");
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
      setResults([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, searchKey, searchId, incrementGenerationCount]);
  
  const fetchAdditionalPages = async (query: string, startPage: number) => {
    const maxInitialPages = 5;
    if (startPage > maxInitialPages) return;
    
    try {
      const cacheKey = `diagramr-search-${query}-page-${startPage}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        console.log(`Using cached results for page ${startPage}`);
        const pageResults = JSON.parse(cachedData);
        const existingUrls = new Set(allResults.current.map(r => r.imageSrc));
        const newResults = pageResults.filter((r: DiagramResult) => !existingUrls.has(r.imageSrc));
        
        if (newResults.length > 0) {
          console.log(`Adding ${newResults.length} new results from cached page ${startPage}`);
          allResults.current = [...allResults.current, ...newResults];
          setHasMore(true);
        }
        
        fetchAdditionalPages(query, startPage + 1);
      } else {
        console.log(`Fetching additional results for page ${startPage}`);
        const additionalResults = await searchGoogleImages(query, searchKey, searchId, startPage);
        
        if (additionalResults.length > 0) {
          console.log(`Got ${additionalResults.length} results for page ${startPage}`);
          sessionStorage.setItem(cacheKey, JSON.stringify(additionalResults));
          
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
      }
    } catch (err) {
      console.error(`Error fetching page ${startPage}:`, err);
    }
  };
  
  const calculateRelevance = (result: DiagramResult, queryTerms: string[]): number => {
    let score = 0;
    
    const title = result.title.toLowerCase();
    
    // Heavily prioritize educational diagram content
    if (title.includes('educational') || title.includes('learning') || 
        title.includes('student') || title.includes('study')) {
      score += 5;
    }
    
    if (title.includes('diagram') || title.includes('visualization') || 
        title.includes('chart') || title.includes('infographic')) {
      score += 4;
    }
    
    // Check if title contains query terms
    queryTerms.forEach(term => {
      if (title.includes(term)) score += 3;
    });
    
    // Check if tags contain query terms
    if (result.tags) {
      queryTerms.forEach(term => {
        if (result.tags?.some(tag => tag.includes(term))) score += 2;
      });
    }
    
    // Check specific educational contexts
    const isDataStructureQuery = queryTerms.some(term => 
      ['data structure', 'algorithm', 'dsa', 'tree', 'graph', 'array'].includes(term));
    
    if (isDataStructureQuery) {
      const dataStructureKeywords = ['data structure', 'algorithm', 'complexity', 'diagram', 'visualization'];
      dataStructureKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 3;
      });
    }
    
    const educationalTerms = ['education', 'learn', 'study', 'school', 'university', 'college', 'academic'];
    const isEducationalQuery = queryTerms.some(term => educationalTerms.includes(term));
    
    if (isEducationalQuery) {
      const educationalKeywords = ['education', 'concept', 'diagram', 'study', 'learn', 'research', 'course'];
      educationalKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
      });
    }
    
    return score;
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
      } else if (lastAction === 'search') {
        const nextSearchPage = currentSearchPage + 1;
        console.log(`Need to fetch more results, checking page ${nextSearchPage}`);
        
        const cacheKey = `diagramr-search-${searchTerm}-page-${nextSearchPage}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        let newPageResults: DiagramResult[] = [];
        
        if (cachedData) {
          console.log(`Loading cached page ${nextSearchPage}`);
          newPageResults = JSON.parse(cachedData);
        } else {
          console.log(`Fetching new page ${nextSearchPage} for ${searchTerm}`);
          newPageResults = await searchGoogleImages(searchTerm, searchKey, searchId, nextSearchPage);
          
          if (newPageResults.length > 0) {
            console.log(`Caching ${newPageResults.length} results from page ${nextSearchPage}`);
            sessionStorage.setItem(cacheKey, JSON.stringify(newPageResults));
          }
        }
        
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
      } else {
        console.log("No more results to load for generation");
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
