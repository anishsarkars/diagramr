
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AccessContextType {
  isPremium: boolean;
  setPremiumUser: (value: boolean) => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

interface AccessProviderProps {
  children: ReactNode;
}

export function AccessProvider({ children }: AccessProviderProps) {
  const [isPremium, setIsPremiumUser] = useState(false);

  const setPremiumUser = (value: boolean) => {
    setIsPremiumUser(value);
  };

  return (
    <AccessContext.Provider
      value={{
        isPremium,
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

// Provide a safe version of the hook for components that might render outside the provider
export const useSafeAccess = () => {
  const context = useContext(AccessContext);
  return context || { isPremium: false, setPremiumUser: () => {} };
};
