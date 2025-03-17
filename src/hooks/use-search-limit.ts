
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth-context";

interface SearchLimitState {
  searchCount: number;
  hasReachedLimit: boolean;
  isLoading: boolean;
  incrementCount: () => Promise<boolean>;
  remainingSearches: number;
  requiresLogin: boolean;
  generationCount: number;
  remainingGenerations: number;
  hasReachedGenerationLimit: boolean;
  incrementGenerationCount: () => Promise<boolean>;
}

// Define constants for search limits
const FREE_TIER_LIMIT = 50; // Registered users get 50 searches per day during beta
const DEMO_LIMIT = 3; // Anonymous users get 3 searches before requiring login
const FREE_GENERATION_LIMIT = 5; // Registered users get 5 generations per day
const DEMO_GENERATION_LIMIT = 1; // Anonymous users get 1 generation before requiring login
const PREMIUM_GENERATION_LIMIT = 20; // Premium users get 20 generations per day

export function useSearchLimit(): SearchLimitState {
  const { user, profile } = useAuth();
  const [searchCount, setSearchCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const isPremium = profile?.is_premium || false;
  
  // During beta, all signed-in users get premium search features
  const isBetaPeriod = true;
  
  // Different logic based on authentication status
  const hasReachedLimit = !user 
    ? searchCount >= DEMO_LIMIT
    : isPremium
      ? false // Premium users don't have a search limit
      : searchCount >= FREE_TIER_LIMIT;
  
  const hasReachedGenerationLimit = !user
    ? generationCount >= DEMO_GENERATION_LIMIT
    : isPremium
      ? generationCount >= PREMIUM_GENERATION_LIMIT
      : generationCount >= FREE_GENERATION_LIMIT;
  
  // Require login after trial limit is reached for anonymous users
  const requiresLogin = !user && (searchCount >= DEMO_LIMIT || generationCount >= DEMO_GENERATION_LIMIT);
  
  // Calculate remaining searches and generations
  const remainingSearches = user 
    ? isPremium
      ? Infinity // Premium users have unlimited searches
      : (FREE_TIER_LIMIT - searchCount) 
    : (DEMO_LIMIT - searchCount);
    
  const remainingGenerations = user
    ? isPremium
      ? (PREMIUM_GENERATION_LIMIT - generationCount)
      : (FREE_GENERATION_LIMIT - generationCount)
    : (DEMO_GENERATION_LIMIT - generationCount);

  useEffect(() => {
    if (!user) {
      // If not logged in, use localStorage for tracking anonymous usage
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('searchData');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          if (data.date === today) {
            setSearchCount(data.searchCount || 0);
            setGenerationCount(data.generationCount || 0);
          } else {
            // Reset for a new day
            localStorage.setItem('searchData', JSON.stringify({ 
              date: today, 
              searchCount: 0, 
              generationCount: 0 
            }));
            setSearchCount(0);
            setGenerationCount(0);
          }
        } catch (error) {
          console.error('Error parsing search data from localStorage:', error);
          // Reset if data is corrupted
          localStorage.setItem('searchData', JSON.stringify({ 
            date: today, 
            searchCount: 0, 
            generationCount: 0 
          }));
          setSearchCount(0);
          setGenerationCount(0);
        }
      } else {
        localStorage.setItem('searchData', JSON.stringify({ 
          date: today, 
          searchCount: 0, 
          generationCount: 0 
        }));
        setSearchCount(0);
        setGenerationCount(0);
      }
      setIsLoading(false);
    } else {
      // If logged in, fetch from Supabase
      fetchUsageCounts();
    }
  }, [user]);

  const fetchUsageCounts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('user_search_logs')
        .select('search_count, generation_count')
        .eq('user_id', user.id)
        .eq('search_date', today)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSearchCount(data.search_count || 0);
        setGenerationCount(data.generation_count || 0);
      } else {
        setSearchCount(0);
        setGenerationCount(0);
      }
    } catch (error) {
      console.error('Error fetching usage counts:', error);
      setSearchCount(0);
      setGenerationCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementCount = async (): Promise<boolean> => {
    // Premium users don't have search limits
    if (user && isPremium) return true;
    
    // Users who reached limit
    if (hasReachedLimit) return false; 
    
    try {
      if (!user) {
        // Update localStorage for non-logged-in users
        const today = new Date().toDateString();
        const storedData = localStorage.getItem('searchData');
        let data;
        
        try {
          data = storedData ? JSON.parse(storedData) : { date: today, searchCount: 0, generationCount: 0 };
        } catch (error) {
          console.error('Error parsing search data:', error);
          data = { date: today, searchCount: 0, generationCount: 0 };
        }
        
        if (data.date !== today) {
          data.date = today;
          data.searchCount = 0;
          data.generationCount = 0;
        }
        
        const newCount = (data.searchCount || 0) + 1;
        data.searchCount = newCount;
        
        localStorage.setItem('searchData', JSON.stringify(data));
        setSearchCount(newCount);
      } else {
        // Update Supabase for logged-in users
        const today = new Date().toISOString().split('T')[0];
        
        // Use upsert operation
        const { error } = await supabase
          .from('user_search_logs')
          .upsert(
            {
              user_id: user.id,
              search_date: today,
              search_count: searchCount + 1,
              generation_count: generationCount
            },
            {
              onConflict: 'user_id,search_date'
            }
          );
        
        if (error) throw error;
        
        setSearchCount(prev => prev + 1);
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing search count:', error);
      return false;
    }
  };
  
  const incrementGenerationCount = async (): Promise<boolean> => {
    if (hasReachedGenerationLimit) return false;
    
    try {
      if (!user) {
        // Update localStorage for non-logged-in users
        const today = new Date().toDateString();
        const storedData = localStorage.getItem('searchData');
        let data;
        
        try {
          data = storedData ? JSON.parse(storedData) : { date: today, searchCount: 0, generationCount: 0 };
        } catch (error) {
          console.error('Error parsing search data:', error);
          data = { date: today, searchCount: 0, generationCount: 0 };
        }
        
        if (data.date !== today) {
          data.date = today;
          data.searchCount = 0;
          data.generationCount = 0;
        }
        
        const newCount = (data.generationCount || 0) + 1;
        data.generationCount = newCount;
        
        localStorage.setItem('searchData', JSON.stringify(data));
        setGenerationCount(newCount);
      } else {
        // Update Supabase for logged-in users
        const today = new Date().toISOString().split('T')[0];
        
        const { error } = await supabase
          .from('user_search_logs')
          .upsert(
            {
              user_id: user.id,
              search_date: today,
              search_count: searchCount,
              generation_count: generationCount + 1
            },
            {
              onConflict: 'user_id,search_date'
            }
          );
        
        if (error) throw error;
        
        setGenerationCount(prev => prev + 1);
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing generation count:', error);
      return false;
    }
  };

  return {
    searchCount,
    hasReachedLimit,
    isLoading,
    incrementCount,
    remainingSearches,
    requiresLogin,
    generationCount,
    remainingGenerations,
    hasReachedGenerationLimit,
    incrementGenerationCount
  };
}
