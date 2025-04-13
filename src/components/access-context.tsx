
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { supabase } from '@/integrations/supabase/client';

interface AccessContextType {
  isPremiumUser: boolean;
  setPremiumUser: (value: boolean) => void;
  refreshPremiumStatus: () => Promise<void>;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

interface AccessProviderProps {
  children: ReactNode;
}

export function AccessProvider({ children }: AccessProviderProps) {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const { user, profile } = useAuth();
  
  // Refresh premium status directly from the database
  const refreshPremiumStatus = async () => {
    if (!user) return;
    
    try {
      console.log("Refreshing premium status for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching premium status:", error);
        return;
      }
      
      console.log("Premium status from database:", data?.is_premium);
      setIsPremiumUser(!!data?.is_premium);
    } catch (err) {
      console.error("Error refreshing premium status:", err);
    }
  };
  
  // Update premium status based on user profile whenever profile changes
  useEffect(() => {
    if (profile?.is_premium) {
      console.log("Setting premium user to true based on profile");
      setIsPremiumUser(true);
    } else if (profile) {
      console.log("Setting premium user to false based on profile");
      setIsPremiumUser(false);
    }
  }, [profile]);
  
  // Double-check premium status on load and whenever user or profile changes
  useEffect(() => {
    if (user) {
      refreshPremiumStatus();
    }
  }, [user]);

  const setPremiumUser = (value: boolean) => {
    console.log("Setting premium user state to:", value);
    setIsPremiumUser(value);
  };

  return (
    <AccessContext.Provider
      value={{
        isPremiumUser,
        setPremiumUser,
        refreshPremiumStatus
      }}
    >
      {children}
    </AccessContext.Provider>
  );
}

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};
