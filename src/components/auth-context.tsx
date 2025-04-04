import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_premium: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfileName: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function AuthProvider({ children, onLogout }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial auth session:", session ? "authenticated" : "not authenticated");
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error("Error fetching initial session:", error);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if this is a new sign-in and create profile if needed
          if (event === 'SIGNED_IN') {
            console.log("New sign in detected, creating profile if needed");
            await createProfileIfNotExists(session.user);
          }
          
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfileIfNotExists = async (user: User) => {
    try {
      // First check if profile exists
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("Error checking profile:", error);
        return;
      }
      
      // If profile doesn't exist, create it
      if (!data) {
        // Use email prefix as the default username
        const defaultUsername = user.email ? user.email.split('@')[0] : `user_${Math.floor(Math.random() * 10000)}`;
        
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: defaultUsername, 
            avatar_url: user.user_metadata?.avatar_url || null,
            is_premium: false
          });
        
        if (createError) {
          console.error("Error creating profile:", createError);
        }
      }
    } catch (error) {
      console.error("Error in profile creation:", error);
    }
  };

  const signOut = async () => {
    try {
      // First, clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear any session data from localStorage
      localStorage.removeItem('diagramr-session');
      localStorage.removeItem('diagramr-username');
      localStorage.removeItem('supabase.auth.token');
      
      // Then call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase signOut error:", error);
        throw error;
      }
      
      // Call the onLogout callback if provided
      if (onLogout) {
        console.log("Running logout callback");
        onLogout();
      }
      
      console.log("User signed out successfully");
      
    } catch (error) {
      console.error("Error during sign out:", error);
      // Even if there's an error, we should still clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Still trigger the callback on error
      if (onLogout) {
        onLogout();
      }
      
      throw error;
    }
  };

  const updateProfileName = async (name: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // First update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ username: name })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Then update the local profile state to show changes immediately
      if (profile) {
        setProfile({
          ...profile,
          username: name
        });
      }
      
      // Store in localStorage for immediate access across components
      localStorage.setItem('diagramr-username', name);
      
      console.log('Profile name updated successfully to:', name);
      return true;
    } catch (error) {
      console.error('Error updating profile name:', error);
      return false;
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signOut,
    updateProfileName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
