import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserRound, LogOut, Check, Loader2, SparklesIcon, ShieldCheck, Zap, AlertTriangle, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import dialog and alert dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Account() {
  const { user, profile, signOut, refreshProfile, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    // Redirect to login page if no user is found
    if (!user && !isLoading) {
      navigate('/auth');
    }
    
    // Set the form values when profile data is loaded
    if (profile) {
      setUserName(profile.username || '');
    }
    
    // Set the email field if it exists
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user, profile, navigate, isLoading]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      console.log("Profile update detected in Account:", event.detail);
      if (event.detail && event.detail.profile) {
        const updatedProfile = event.detail.profile;
        console.log("Setting username to:", updatedProfile.username);
        setUserName(updatedProfile.username || "");
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  // Set initial values when profile data loads
  useEffect(() => {
    if (profile) {
      console.log("Initial profile data loaded:", profile);
      setUserName(profile.username || "");
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!userName.trim()) {
        toast.error("Display name cannot be empty");
        setIsLoading(false);
        return;
      }
      
      console.log("Attempting to update profile with username:", userName.trim());
      
      // Use the updateProfile method from auth context
      const success = await updateProfile({ 
        username: userName.trim() 
      });
      
      if (!success) {
        throw new Error("Failed to update profile");
      }
      
      toast.success("Profile updated successfully", {
        description: "Your changes have been saved.",
        icon: <Check className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation is now handled in auth-context
      toast.success("Signing out...");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { success, error } = await deleteAccount();
      
      if (success) {
        toast.success("Account deleted", {
          description: "Your account has been permanently deleted.",
        });
        // Redirect to home page is handled in auth-context signOut
      } else {
        toast.error("Failed to delete account", {
          description: error || "Please try again later",
        });
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Something went wrong", {
        description: "We couldn't process your request. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const userInitial = getInitials(userName || email || "User");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container max-w-4xl py-16 px-4 relative">
        {/* Background decoration elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none"></div>

        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">Account Settings</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Manage your profile and settings</p>
        </motion.div>
        
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:sticky md:top-24 h-fit"
          >
            <Card className="overflow-hidden border border-border/60 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 mt-2">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    {profile?.is_premium && (
                      <Badge 
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 px-2 py-1"
                      >
                        <SparklesIcon className="h-3 w-3 mr-1" /> PRO
                      </Badge>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-semibold mb-1">{userName || "Username"}</h2>
                  <p className="text-muted-foreground text-sm mb-4">{email}</p>
                  
                  <Separator className="mb-6" />
                  
                  <div className="w-full space-y-2">
                    <Button 
                      variant="outline" 
                      className="gap-2 w-full justify-start"
                      onClick={() => setActiveSection("profile")}
                    >
                      <UserRound className="h-4 w-4" />
                      <span>Profile</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="gap-2 w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </Button>
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      variant="outline" 
                      className="gap-2 w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash className="h-4 w-4" />
                      <span>Delete Account</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your account settings and information
                </CardDescription>
                </CardHeader>
                
              <CardContent className="space-y-8 pt-2">
                    <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Display Name
                  </Label>
                      <Input 
                        id="username" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                    placeholder="Enter your display name"
                    className="bg-background/50 border-border/60 h-11"
                      />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    This is the name that will be displayed to other users
                  </p>
                    </div>
                    
                    <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                      <Input 
                        id="email" 
                        value={email}
                        disabled
                        placeholder="Your email address"
                    className="bg-muted/50 h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Your email address cannot be changed
                  </p>
                </div>
                
                {profile?.is_premium ? (
                  <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-primary mb-0.5">Premium Account</h4>
                      <p className="text-xs text-muted-foreground">
                        You have access to all premium features and benefits
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-border/80 bg-muted/30 rounded-lg p-4 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-0.5">Free Account</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Upgrade to premium to access all features and benefits
                      </p>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate('/pricing')}>
                        View Pricing
                      </Button>
                    </div>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isLoading} 
                    className="gap-2 h-11 px-6 bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                      </div>
                  </CardContent>
            </Card>
            
            {/* Password reset card */}
            <Card className="border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8 pt-2">
                <div>
                  <h3 className="text-md font-medium mb-2">Reset Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you need to reset your password, we'll send you an email with instructions.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/forgot-password")}
                    className="h-9"
                  >
                    Reset Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
      
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
