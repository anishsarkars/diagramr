
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';

interface AccessContextType {
  isPremiumUser: boolean;
  setPremiumUser: (value: boolean) => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

interface AccessProviderProps {
  children: ReactNode;
}

export function AccessProvider({ children }: AccessProviderProps) {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const { user, profile } = useAuth();
  
  // Update premium status based on user profile
  useEffect(() => {
    if (profile?.is_premium) {
      setIsPremiumUser(true);
    } else {
      setIsPremiumUser(false);
    }
  }, [profile]);

  const setPremiumUser = (value: boolean) => {
    setIsPremiumUser(value);
  };

  return (
    <AccessContext.Provider
      value={{
        isPremiumUser,
        setPremiumUser
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
