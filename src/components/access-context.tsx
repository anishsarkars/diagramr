
import React, { createContext, useState, useContext, ReactNode } from 'react';

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
