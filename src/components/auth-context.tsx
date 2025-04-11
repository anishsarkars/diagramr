import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "sonner";

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
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
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

  // Implement sign in functionality
  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in:", error.message);
        toast.error("Failed to sign in", {
          description: error.message,
        });
        return null;
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsNewLogin(true);
        toast.success("Signed in successfully!");
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      toast.error("An unexpected error occurred");
      return null;
    }
  };

  // Implement sign up functionality
  const signUp = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Error signing up:", error.message);
        toast.error("Failed to sign up", {
          description: error.message,
        });
        return null;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session === null) {
          toast.success("Registration successful!", {
            description: "Please check your email to confirm your account.",
          });
        } else {
          setUser(data.user);
          setSession(data.session);
          setIsNewLogin(true);
          toast.success("Account created successfully!");
        }
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      toast.error("An unexpected error occurred");
      return null;
    }
  };

  // Enhanced function to update the user profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) {
      console.error("Cannot update profile: No user is logged in");
      return false;
    }
    
    try {
      console.log("Updating profile with data:", data);
      
      // Validate data before sending to server
      if (data.username && typeof data.username === 'string') {
        // Trim whitespace and limit length
        data.username = data.username.trim().substring(0, 50);
        
        // Check if username is empty after trimming
        if (!data.username) {
          console.error("Username cannot be empty after trimming");
          return false;
        }
      }
      
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
        toast.error("Failed to update profile", {
          description: "Please try again later.",
        });
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
        
        // Use a more reliable event dispatch approach
        try {
          // First try using CustomEvent
          window.dispatchEvent(new CustomEvent('profile-updated', { 
            detail: { profile: updatedProfile } 
          }));
        } catch (eventError) {
          console.error("Error dispatching profile-updated event:", eventError);
          // Fallback to a simple reload if event dispatch fails
          window.location.reload();
        }
        
        console.log("Profile successfully updated:", updatedProfile);
        toast.success("Profile updated successfully!");
        return true;
      } else {
        console.error("No data returned from profile update");
        toast.error("Failed to update profile", {
          description: "Please try again later.",
        });
        return false;
      }
    } catch (error) {
      console.error("Unexpected error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "An unexpected error occurred.",
      });
      return false;
    }
  };

  const fetchProfile = async (userId: string) => {
    if (!userId) {
      console.error("Cannot fetch profile: No user ID provided");
      setIsLoading(false);
      return;
    }
    
    console.log("Fetching profile for user:", userId);
    
    // Add retry logic for more reliability
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile not found, attempt to create it
            console.log("Profile not found, attempting to create it");
            const created = await createProfileIfNotExists({ id: userId });
            
            if (created) {
              // Retry fetch after creation
              retryCount++;
              continue;
            } else {
              console.error("Failed to create profile");
              break;
            }
          } else {
            console.error(`Error fetching profile (attempt ${retryCount + 1}/${maxRetries}):`, error);
            retryCount++;
            
            if (retryCount < maxRetries) {
              // Wait a bit before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
              continue;
            }
          }
        } else if (data) {
          console.log("Profile fetched successfully:", data);
          
          // Update the local profile state
          setProfile(data as UserProfile);
          
          // Dispatch profile updated event
          try {
            window.dispatchEvent(new CustomEvent('profile-updated', { 
              detail: { profile: data } 
            }));
          } catch (eventError) {
            console.error("Error dispatching profile-updated event:", eventError);
          }
          
          break; // Success, exit the retry loop
        } else {
          console.error("No profile data found");
          retryCount++;
        }
      } catch (error) {
        console.error(`Unexpected error fetching profile (attempt ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        }
      }
    }
    
    if (retryCount >= maxRetries) {
      console.error(`Failed to fetch profile after ${maxRetries} attempts`);
    }
    
    setIsLoading(false);
  };

  // Function to manually refresh user profile - can be called after profile updates
  const refreshProfile = async () => {
    if (!user) {
      console.error("Cannot refresh profile: No user is logged in");
      return;
    }
    
    console.log("Refreshing profile for user:", user.id);
    
    // Add retry logic for more reliability
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(`Error refreshing profile (attempt ${retryCount + 1}/${maxRetries}):`, error);
          
          // If it's a "not found" error, try to create the profile
          if (error.code === 'PGRST116') {
            console.log("Profile not found, attempting to create it");
            const created = await createProfileIfNotExists(user);
            if (created) {
              // If profile was created, retry the fetch
              retryCount++;
              continue;
            }
          }
          
          // For other errors, increment retry count and try again
          retryCount++;
          if (retryCount < maxRetries) {
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
            continue;
          }
          
          return;
        }

        if (data) {
          console.log("Profile refreshed successfully:", data);
          
          // Update the local profile state
          setProfile(data as UserProfile);
          
          // Dispatch an event that other components can listen to
          try {
            const event = new CustomEvent('profile-updated', { 
              detail: { profile: data } 
            });
            console.log("Dispatching profile-updated event:", event);
            window.dispatchEvent(event);
          } catch (eventError) {
            console.error("Error dispatching profile-updated event:", eventError);
            // Continue even if event dispatch fails
          }
          
          return data;
        } else {
          console.error("No profile data found during refresh");
          retryCount++;
        }
      } catch (error) {
        console.error(`Unexpected error refreshing profile (attempt ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        }
      }
    }
    
    console.error(`Failed to refresh profile after ${maxRetries} attempts`);
  };

  const createProfileIfNotExists = async (user: User | { id: string }): Promise<boolean> => {
    try {
      console.log("Checking if profile exists for user:", user.id);
      
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
        console.log("Profile not found, creating new profile");
        
        // Get full user data if only ID was provided
        let fullUser = user as User;
        if (!('user_metadata' in user)) {
          const { data: userData, error: userError } = await supabase.auth.getUser(user.id);
          if (userError) {
            console.error("Error fetching user data:", userError);
            return false;
          }
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
        
        // Ensure username is not empty and has a reasonable length
        username = username.trim().substring(0, 50);
        if (!username) {
          username = `user_${Math.floor(Math.random() * 10000)}`;
        }
        
        console.log("Creating new profile with username:", username);
        
        // Add retry logic for profile creation
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                username: username, 
                avatar_url: fullUser.user_metadata?.avatar_url || null,
                is_premium: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (createError) {
              console.error(`Error creating profile (attempt ${retryCount + 1}/${maxRetries}):`, createError);
              retryCount++;
              
              if (retryCount < maxRetries) {
                // Wait a bit before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
                continue;
              }
              
              return false;
            }
            
            console.log("Profile created successfully");
            
            // Fetch the newly created profile to update local state
            const { data: newProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            
            if (fetchError) {
              console.error("Error fetching newly created profile:", fetchError);
              // Continue anyway since profile was created
            } else if (newProfile) {
              // Update local state with the new profile
              setProfile(newProfile as UserProfile);
              
              // Dispatch profile updated event
              try {
                window.dispatchEvent(new CustomEvent('profile-updated', { 
                  detail: { profile: newProfile } 
                }));
              } catch (eventError) {
                console.error("Error dispatching profile-updated event:", eventError);
              }
            }
            
            return true;
          } catch (error) {
            console.error(`Unexpected error creating profile (attempt ${retryCount + 1}/${maxRetries}):`, error);
            retryCount++;
            
            if (retryCount < maxRetries) {
              // Wait a bit before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
            }
          }
        }
        
        console.error(`Failed to create profile after ${maxRetries} attempts`);
        return false;
      }
      
      console.log("Profile already exists");
      return false;
    } catch (error) {
      console.error("Unexpected error in profile creation:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      
      // Clear all session and local storage data first
      sessionStorage.clear();
      
      // Keep certain items in localStorage that should persist
      const searchHistory = localStorage.getItem('diagramr-search-history');
      const theme = localStorage.getItem('diagramr-theme');
      
      // Clear localStorage but preserve specific items
      localStorage.clear();
      
      // Restore persistent items
      if (searchHistory) localStorage.setItem('diagramr-search-history', searchHistory);
      if (theme) localStorage.setItem('diagramr-theme', theme);
      
      // Reset local state before API call to ensure UI updates immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Call the actual signOut method
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error("Error during signOut:", error);
        toast.error("Failed to sign out", {
          description: error.message,
        });
        throw error;
      }
      
      // Directly navigate to home page
      window.location.href = '/';
      
      if (onLogout) {
        onLogout();
      }
      
      toast.success("Signed out successfully");
      return true;
    } catch (error) {
      console.error("Error during signOut:", error);
      // Even if there's an error, try to clear state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Attempt to redirect despite error
      window.location.href = '/';
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
      
      // Set proper redirect URL with absolute path and ensure it's properly encoded
      const redirectUrl = encodeURI(`${window.location.origin}/auth?reset=true`);
      console.log("Redirect URL for password reset:", redirectUrl);
      
      // First check if the user exists
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      const userExists = users?.some((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!userExists) {
        return { success: false, error: "No account found with this email address" };
      }
      
      // Send the reset email with retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
          });
          
          if (error) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            lastError = error;
            attempts++;
            if (attempts < maxAttempts) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
              continue;
            }
          } else {
            console.log("Password reset email sent successfully");
            return { success: true };
          }
        } catch (retryError) {
          console.error(`Attempt ${attempts + 1} failed with unexpected error:`, retryError);
          lastError = retryError;
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
            continue;
          }
        }
      }
      
      // If we get here, all attempts failed
      return { 
        success: false, 
        error: lastError instanceof Error ? lastError.message : "Failed to send password reset email after multiple attempts" 
      };
    } catch (error) {
      console.error("Unexpected error in forgotPassword:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred while sending the password reset email" 
      };
    }
  };
  
  // Function to handle account deletion
  const deleteAccount = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Unable to verify user identity");
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
      );
      if (!confirmed) {
        return { success: false, error: "Account deletion cancelled" };
      }

      // Delete user's saved diagrams first
      const { error: diagramsError } = await supabase
        .from('saved_diagrams')
        .delete()
        .eq('user_id', user.id);

      if (diagramsError) {
        console.error('Error deleting saved diagrams:', diagramsError);
        throw new Error("Failed to delete saved diagrams");
      }

      // Delete user's search logs
      const { error: searchLogsError } = await supabase
        .from('user_search_logs')
        .delete()
        .eq('user_id', user.id);

      if (searchLogsError) {
        console.error('Error deleting search logs:', searchLogsError);
        throw new Error("Failed to delete search history");
      }

      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw new Error("Failed to delete profile");
      }

      // Finally, delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) {
        console.error('Error deleting auth user:', authError);
        throw new Error("Failed to delete account");
      }

      // Clear local storage and state
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('diagramr-search-history');
      localStorage.removeItem(`diagramr-has-set-name-${user.id}`);
      setUser(null);
      setSession(null);
      setProfile(null);

      return { success: true };
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred while deleting your account"
      };
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

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
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
