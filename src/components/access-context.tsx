
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

type AccessStatus = 'unknown' | 'checking' | 'authorized' | 'unauthorized';

interface AccessContextType {
  accessStatus: AccessStatus;
  validateAccessCode: (code: string) => Promise<boolean>;
  showAccessForm: boolean;
  setShowAccessForm: (show: boolean) => void;
  hasValidAccessCode: boolean;
  celebrateAccess: () => void;
  isPremiumUser: boolean;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

interface AccessProviderProps {
  children: ReactNode;
}

export function AccessProvider({ children }: AccessProviderProps) {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('unknown');
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [hasValidAccessCode, setHasValidAccessCode] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Check localStorage for existing valid access code on mount
  useEffect(() => {
    const checkExistingAccess = async () => {
      setAccessStatus('checking');
      
      const storedCode = localStorage.getItem('diagramr-access-code');
      if (storedCode) {
        // Validate the stored code against valid codes
        const validCodes = ["DIAGRAMR2023", "DIA2025"];
        if (validCodes.includes(storedCode)) {
          setAccessStatus('authorized');
          setHasValidAccessCode(true);
          setIsPremiumUser(storedCode === "DIA2025"); // Set as premium user if using the exclusive code
        } else {
          setAccessStatus('unauthorized');
          localStorage.removeItem('diagramr-access-code');
        }
      } else {
        setAccessStatus('unauthorized');
      }
    };
    
    checkExistingAccess();
  }, []);

  const celebrateAccess = () => {
    // Trigger premium confetti effect
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#9b87f5', '#7E69AB', '#D946EF'], // Gold and purple theme
    });
    
    // Add additional burst for premium effect
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 }
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 }
      });
    }, 300);
  };

  const validateAccessCode = async (code: string): Promise<boolean> => {
    try {
      // For now, we'll use hardcoded valid codes
      const validCodes = ["DIAGRAMR2023", "DIA2025"];
      
      // Check if the code is valid
      if (validCodes.includes(code)) {
        // Store the valid code
        localStorage.setItem('diagramr-access-code', code);
        setAccessStatus('authorized');
        setHasValidAccessCode(true);
        
        // Check if it's our premium code
        if (code === "DIA2025") {
          setIsPremiumUser(true);
          celebrateAccess();
        }
        
        return true;
      } else {
        setAccessStatus('unauthorized');
        return false;
      }
    } catch (error) {
      console.error('Error validating access code:', error);
      setAccessStatus('unauthorized');
      return false;
    }
  };

  return (
    <AccessContext.Provider
      value={{
        accessStatus,
        validateAccessCode,
        showAccessForm,
        setShowAccessForm,
        hasValidAccessCode,
        celebrateAccess,
        isPremiumUser
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
