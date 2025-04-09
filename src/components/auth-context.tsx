import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";

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
  signOut: () => Promise<boolean>;
  isNewLogin: boolean;
  setIsNewLogin: (value: boolean) => void;
  refreshProfile: () => Promise<UserProfile | undefined>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
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
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  // Enhanced function to update the user profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Updating profile with data:", data);
      
      // Using upsert instead of update to ensure profile exists
      const { data: updateData, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id'
        })
        .select('*');
      
      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }
      
      console.log("Profile update response:", updateData);
      
      if (updateData && updateData.length > 0) {
        // Update the local state immediately
        const updatedProfile = updateData[0] as UserProfile;
        
        // Ensure we maintain existing profile data
        setProfile(prev => ({
          ...prev,
          ...updatedProfile
        }));
        
        // Use setTimeout to ensure the event fires after state update
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('profile-updated', { 
            detail: { profile: updatedProfile } 
          }));
        }, 50);
        
        console.log("Profile successfully updated:", updatedProfile);
        return true;
      } else {
        console.error("No data returned from profile update");
        return false;
      }
    } catch (error) {
      console.error("Unexpected error updating profile:", error);
      return false;
    }
  };

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial auth session:", session ? "authenticated" : "not authenticated");
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        // Store the user ID to detect changes
        setPrevUserId(session.user.id);
      } else {
        setIsLoading(false);
      }
      setInitialSessionChecked(true);
    }).catch(error => {
      console.error("Error fetching initial session:", error);
      setIsLoading(false);
      setInitialSessionChecked(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check for login, signup, or user switching
          const isUserChanged = prevUserId !== session.user.id;
          
          // Force confetti on explicit sign-in events
          if (initialSessionChecked && 
              (event === 'SIGNED_IN' || isUserChanged || !prevUserId)) {
            console.log("New login or signup detected, triggering confetti celebration");
            setIsNewLogin(true);
            
            // Store login timestamp for session consistency
            localStorage.setItem('last_login_time', Date.now().toString());
            sessionStorage.setItem('confetti_shown', 'false');
          }
          
          // Update previous user ID
          setPrevUserId(session.user.id);
          
          // Create profile if this is a new user
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const profileCreated = await createProfileIfNotExists(session.user);
            if (profileCreated) {
              console.log("New profile created, showing confetti");
              setIsNewLogin(true);
            }
          }
          
          // Always fetch fresh profile data on auth changes
          await fetchProfile(session.user.id);
        } else {
          setPrevUserId(null);
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialSessionChecked, prevUserId]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, attempt to create it
          await createProfileIfNotExists({ id: userId });
          // Retry fetch after creation
          const { data: retryData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          
          if (retryData) {
            console.log("Profile created and fetched:", retryData);
            setProfile(retryData as UserProfile);
          }
        } else {
          console.error("Error fetching profile:", error);
        }
      } else if (data) {
        console.log("Profile fetched:", data);
        setProfile(data as UserProfile);
        
        // Broadcast profile update
        window.dispatchEvent(new CustomEvent('profile-updated', { 
          detail: { profile: data } 
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh user profile - can be called after profile updates
  const refreshProfile = async () => {
    if (user) {
      console.log("Refreshing profile for user:", user.id);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error refreshing profile:", error);
          return;
        }

        if (data) {
          console.log("Profile refreshed successfully:", data);
          
          // Update the local profile state
          setProfile(data as UserProfile);
          
          // Dispatch an event that other components can listen to
          const event = new CustomEvent('profile-updated', { 
            detail: { profile: data } 
          });
          console.log("Dispatching profile-updated event:", event);
          window.dispatchEvent(event);
          
          return data;
        } else {
          console.error("No profile data found during refresh");
        }
      } catch (error) {
        console.error("Unexpected error refreshing profile:", error);
      }
    }
  };

  const createProfileIfNotExists = async (user: User | { id: string }): Promise<boolean> => {
    try {
      // First check if profile exists
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("Error checking profile:", error);
        return false;
      }
      
      // If profile doesn't exist, create it
      if (!data) {
        // Get full user data if only ID was provided
        let fullUser = user as User;
        if (!('user_metadata' in user)) {
          const { data: userData } = await supabase.auth.getUser(user.id);
          if (userData?.user) {
            fullUser = userData.user;
          }
        }
        
        // Use metadata name if available, otherwise use email prefix or generate random name
        let username = '';
        
        // First priority: user_metadata.name if available
        if (fullUser.user_metadata?.name) {
          username = fullUser.user_metadata.name;
        } 
        // Second priority: email prefix
        else if (fullUser.email) {
          username = fullUser.email.split('@')[0];
        } 
        // Last resort: random user ID
        else {
          username = `user_${Math.floor(Math.random() * 10000)}`;
        }
        
        console.log("Creating new profile with username:", username);
        
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: username, 
            avatar_url: fullUser.user_metadata?.avatar_url || null,
            is_premium: false
          });
        
        if (createError) {
          console.error("Error creating profile:", createError);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in profile creation:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      
      // Clear session data first
      sessionStorage.clear();
      localStorage.removeItem('last_login_time');
      
      // Call the actual signOut method
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during signOut:", error);
        throw error;
      }
      
      // Reset local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Using setTimeout gives a small delay to ensure auth state is cleared
      setTimeout(() => {
        // Redirect to home page after sign out
        window.location.href = '/';
        
        if (onLogout) {
          onLogout();
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  };

  // Function to handle forgot password
  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: "Please provide a valid email address" };
    }
    
    try {
      console.log("Sending password reset email to:", email);
      
      // Set proper redirect URL with absolute path
      const redirectUrl = `${window.location.origin}/auth?reset=true`;
      console.log("Redirect URL for password reset:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Password reset email sent successfully");
      return { success: true };
    } catch (error) {
      console.error("Unexpected error in forgotPassword:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      };
    }
  };
  
  // Function to handle account deletion
  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "No active user session" };
    
    try {
      // First, capture the user ID since we'll lose the session
      const userId = user.id;
      console.log("Attempting to delete account for user:", userId);
      
      // Step 1: Delete the user's profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error("Error deleting user profile:", profileError);
        return { success: false, error: profileError.message };
      }
      
      // Step 2: Delete any other user-related data
      try {
        // Delete saved diagrams
        await supabase
          .from('saved_diagrams')
          .delete()
          .eq('user_id', userId);
        
        // Delete search logs
        await supabase
          .from('user_search_logs')
          .delete()
          .eq('user_id', userId);
          
        // Add any other tables that need cleaning up
      } catch (dataError) {
        console.error("Error deleting user data:", dataError);
        // Continue with deletion even if some data cleanup fails
      }
      
      // Step 3: Request the admin function to delete the user account
      const { error: adminDeleteError } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId }
      });
      
      if (adminDeleteError) {
        console.error("Error calling delete-user function:", adminDeleteError);
        // Continue anyway to sign out the user
      }
      
      // Step 4: Sign out the user - this will clear the session
      await signOut();
      
      return { 
        success: true 
      };
    } catch (error) {
      console.error("Unexpected error in deleteAccount:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      };
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signOut,
    isNewLogin,
    setIsNewLogin,
    refreshProfile,
    updateProfile,
    forgotPassword,
    deleteAccount
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
