
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AccessStatus = 'unknown' | 'checking' | 'authorized' | 'unauthorized';

interface AccessContextType {
  accessStatus: AccessStatus;
  validateAccessCode: (code: string) => Promise<boolean>;
  showAccessForm: boolean;
  setShowAccessForm: (show: boolean) => void;
  hasValidAccessCode: boolean;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

interface AccessProviderProps {
  children: ReactNode;
}

export function AccessProvider({ children }: AccessProviderProps) {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('unknown');
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [hasValidAccessCode, setHasValidAccessCode] = useState(false);

  // Check localStorage for existing valid access code on mount
  useEffect(() => {
    const checkExistingAccess = async () => {
      setAccessStatus('checking');
      
      const storedCode = localStorage.getItem('diagramr-access-code');
      if (storedCode) {
        // Validate the stored code
        try {
          const { data, error } = await supabase
            .from('access_codes')
            .select('*')
            .eq('code', storedCode)
            .single();
            
          if (data && !error) {
            setAccessStatus('authorized');
            setHasValidAccessCode(true);
          } else {
            setAccessStatus('unauthorized');
            localStorage.removeItem('diagramr-access-code');
          }
        } catch (error) {
          console.error('Error checking access code:', error);
          setAccessStatus('unauthorized');
        }
      } else {
        setAccessStatus('unauthorized');
      }
    };
    
    checkExistingAccess();
  }, []);

  const validateAccessCode = async (code: string): Promise<boolean> => {
    try {
      // In a real app, this would validate against a database
      // For now, we'll use a hardcoded valid code: "DIAGRAMR2023"
      const validCode = "DIAGRAMR2023";
      
      // Check if the code is valid
      if (code === validCode) {
        // Store the valid code
        localStorage.setItem('diagramr-access-code', code);
        setAccessStatus('authorized');
        setHasValidAccessCode(true);
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
        hasValidAccessCode
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
