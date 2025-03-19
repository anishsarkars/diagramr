
import { useCallback, useRef, useState, useEffect } from 'react';

interface UseInfiniteScrollOptions<T> {
  items: T[];
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
  threshold?: number;
  pageSize?: number;
  initialItems?: number;
}

export function useInfiniteScroll<T>({
  items,
  hasMore,
  loadMore,
  isLoading,
  threshold = 300,
  pageSize = 20,
  initialItems = 20
}: UseInfiniteScrollOptions<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
  // Update visible items when items change
  useEffect(() => {
    if (items.length > 0) {
      setVisibleItems(items.slice(0, Math.min(items.length, initialItems)));
    } else {
      setVisibleItems([]);
    }
  }, [items, initialItems]);
  
  // Show more items from the already loaded ones
  const showMoreItems = useCallback(() => {
    setVisibleItems(prev => {
      const nextCount = prev.length + pageSize;
      return items.slice(0, Math.min(items.length, nextCount));
    });
  }, [items, pageSize]);
  
  // Load more items from the data source
  const fetchMoreItems = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      await loadMore();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, loadMore]);
  
  // Setup the intersection observer for infinite scrolling
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      // If the last item is visible
      if (entries[0].isIntersecting) {
        console.log("Last item is visible, current items:", visibleItems.length, "total:", items.length);
        
        // If we have more items locally to show
        if (visibleItems.length < items.length) {
          console.log("Showing more items from loaded results");
          showMoreItems();
        } 
        // If we need to fetch more from backend
        else if (hasMore) {
          console.log("Loading more items from backend");
          fetchMoreItems();
        }
      }
    }, {
      rootMargin: `0px 0px ${threshold}px 0px`,
    });
    
    if (node) {
      console.log("Observing last item");
      observer.current.observe(node);
    }
  }, [isLoading, isLoadingMore, visibleItems.length, items.length, hasMore, showMoreItems, fetchMoreItems, threshold]);
  
  return {
    visibleItems,
    isLoadingMore,
    lastItemRef,
    hasMoreVisible: visibleItems.length < items.length || hasMore
  };
}
