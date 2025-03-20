
import { useAuth } from '@/components/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';

// For non-logged-in users
const GUEST_DAILY_SEARCH_LIMIT = 3;
const GUEST_DAILY_GENERATION_LIMIT = 1;

// For logged-in free users
const FREE_DAILY_SEARCH_LIMIT = 20;
const FREE_DAILY_GENERATION_LIMIT = 3;

// For premium users
const PREMIUM_DAILY_SEARCH_LIMIT = 50;
const PREMIUM_DAILY_GENERATION_LIMIT = 10;

export const useSearchLimit = () => {
  const { user, profile } = useAuth();
  const [searchCount, setSearchCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const isPremium = profile?.is_premium || false;
  
  // Get the appropriate limits based on user status
  const dailySearchLimit = isPremium 
    ? PREMIUM_DAILY_SEARCH_LIMIT 
    : user 
      ? FREE_DAILY_SEARCH_LIMIT 
      : GUEST_DAILY_SEARCH_LIMIT;
      
  const dailyGenerationLimit = isPremium
    ? PREMIUM_DAILY_GENERATION_LIMIT
    : user
      ? FREE_DAILY_GENERATION_LIMIT
      : GUEST_DAILY_GENERATION_LIMIT;
  
  const remainingSearches = dailySearchLimit - searchCount;
  const remainingGenerations = dailyGenerationLimit - generationCount;
  
  const hasReachedLimit = remainingSearches <= 0;
  const hasReachedGenerationLimit = remainingGenerations <= 0;
  
  // Check if the user needs to login to continue
  const requiresLogin = !user && (hasReachedLimit || hasReachedGenerationLimit);
  
  // Load search counts from local storage for guests or from supabase for logged in users
  const loadCounts = useCallback(async () => {
    setLoading(true);
    
    try {
      if (user) {
        // Fetch counts from Supabase
        const { data, error } = await supabase
          .from('user_search_logs')
          .select('search_count, generation_count')
          .eq('user_id', user.id)
          .eq('search_date', new Date().toISOString().split('T')[0])
          .single();
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is expected if no searches today
          console.error('Error fetching search counts:', error);
        }
        
        if (data) {
          setSearchCount(data.search_count || 0);
          setGenerationCount(data.generation_count || 0);
        } else {
          // No record for today yet
          setSearchCount(0);
          setGenerationCount(0);
        }
      } else {
        // Guest user, use local storage
        const today = new Date().toISOString().split('T')[0];
        const storedData = localStorage.getItem('guestSearchData');
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.date === today) {
            setSearchCount(parsedData.searchCount || 0);
            setGenerationCount(parsedData.generationCount || 0);
          } else {
            // Reset for a new day
            setSearchCount(0);
            setGenerationCount(0);
            localStorage.setItem('guestSearchData', JSON.stringify({
              date: today,
              searchCount: 0,
              generationCount: 0
            }));
          }
        } else {
          // Initialize for first time
          localStorage.setItem('guestSearchData', JSON.stringify({
            date: today,
            searchCount: 0,
            generationCount: 0
          }));
        }
      }
    } catch (error) {
      console.error('Error in useSearchLimit:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Increment search count
  const incrementCount = useCallback(async (): Promise<boolean> => {
    if (hasReachedLimit) return false;
    
    try {
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        
        // Upsert to user_search_logs
        const { error } = await supabase
          .from('user_search_logs')
          .upsert({
            user_id: user.id,
            search_date: today,
            search_count: searchCount + 1,
            generation_count: generationCount
          }, { onConflict: 'user_id, search_date' });
        
        if (error) throw error;
      } else {
        // Guest user, use local storage
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('guestSearchData', JSON.stringify({
          date: today,
          searchCount: searchCount + 1,
          generationCount: generationCount
        }));
      }
      
      setSearchCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error incrementing search count:', error);
      return false;
    }
  }, [user, searchCount, generationCount, hasReachedLimit]);
  
  // Increment generation count
  const incrementGenerationCount = useCallback(async (): Promise<boolean> => {
    if (hasReachedGenerationLimit) return false;
    
    try {
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        
        // Upsert to user_search_logs
        const { error } = await supabase
          .from('user_search_logs')
          .upsert({
            user_id: user.id,
            search_date: today,
            search_count: searchCount,
            generation_count: generationCount + 1
          }, { onConflict: 'user_id, search_date' });
        
        if (error) throw error;
      } else {
        // Guest user, use local storage
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('guestSearchData', JSON.stringify({
          date: today,
          searchCount: searchCount,
          generationCount: generationCount + 1
        }));
      }
      
      setGenerationCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error incrementing generation count:', error);
      return false;
    }
  }, [user, searchCount, generationCount, hasReachedGenerationLimit]);
  
  useEffect(() => {
    loadCounts();
  }, [loadCounts]);
  
  return {
    searchCount,
    generationCount,
    remainingSearches,
    remainingGenerations,
    hasReachedLimit,
    hasReachedGenerationLimit,
    requiresLogin,
    loading,
    incrementCount,
    incrementGenerationCount,
    loadCounts,
    dailySearchLimit,
    dailyGenerationLimit,
    isPremium
  };
};
