
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
}

// Define constants for search limits
const FREE_TIER_LIMIT = 30; // Updated to 30 searches per day for registered users
const DEMO_LIMIT = 3; // Anonymous users get 3 searches before requiring login

export function useSearchLimit(): SearchLimitState {
  const { user, profile } = useAuth();
  const [searchCount, setSearchCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const isPremium = profile?.is_premium || false;
  
  // Different logic based on authentication status
  const hasReachedLimit = !isPremium && (
    user ? searchCount >= FREE_TIER_LIMIT : searchCount >= DEMO_LIMIT
  );
  
  // Require login after trial limit is reached for anonymous users
  const requiresLogin = !user && searchCount >= DEMO_LIMIT;
  
  // Calculate remaining searches
  const remainingSearches = user 
    ? (FREE_TIER_LIMIT - searchCount) 
    : (DEMO_LIMIT - searchCount);

  useEffect(() => {
    if (!user) {
      // If not logged in, use localStorage for tracking anonymous usage
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('searchData');
      
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.date === today) {
          setSearchCount(data.count);
        } else {
          // Reset for a new day
          localStorage.setItem('searchData', JSON.stringify({ date: today, count: 0 }));
          setSearchCount(0);
        }
      } else {
        localStorage.setItem('searchData', JSON.stringify({ date: today, count: 0 }));
        setSearchCount(0);
      }
      setIsLoading(false);
    } else {
      // If logged in, fetch from Supabase
      fetchSearchCount();
    }
  }, [user]);

  const fetchSearchCount = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('user_search_logs')
        .select('search_count')
        .eq('user_id', user.id)
        .eq('search_date', today)
        .maybeSingle();
      
      if (error) throw error;
      
      setSearchCount(data?.search_count || 0);
    } catch (error) {
      console.error('Error fetching search count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementCount = async (): Promise<boolean> => {
    if (isPremium) return true; // Premium users have unlimited searches
    
    if (hasReachedLimit) return false; // Free tier users who reached limit
    
    try {
      if (!user) {
        // Update localStorage for non-logged-in users
        const today = new Date().toDateString();
        const newCount = searchCount + 1;
        localStorage.setItem('searchData', JSON.stringify({ date: today, count: newCount }));
        setSearchCount(newCount);
      } else {
        // Update Supabase for logged-in users
        const today = new Date().toISOString().split('T')[0];
        
        // Fixed upsert operation
        const { error } = await supabase
          .from('user_search_logs')
          .upsert(
            {
              user_id: user.id,
              search_date: today,
              search_count: searchCount + 1
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

  return {
    searchCount,
    hasReachedLimit,
    isLoading,
    incrementCount,
    remainingSearches,
    requiresLogin
  };
}
