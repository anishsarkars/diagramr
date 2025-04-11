
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
  const [isPremium, setIsPremium] = useState(false);

  const setPremiumUser = (value: boolean) => {
    setIsPremium(value);
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
