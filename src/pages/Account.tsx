import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  User, 
  Settings, 
  Bell, 
  CreditCard, 
  LogOut, 
  Check,
  Loader2,
  Lock,
  Sparkles
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Account() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    newFeatures: true,
    searchAlerts: false
  });
  
  // Security settings
  const [passwordSettings, setPasswordSettings] = useState({
    twoFactorEnabled: false,
    passwordLastChanged: "Never"
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Initialize form with user data
    if (profile) {
      setUserName(profile.username || "");
    }
    
    if (user) {
      setEmail(user.email || "");
    }
  }, [user, profile, navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: userName
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update notification settings in the database
      try {
        // Store notification preferences in local storage
        localStorage.setItem('diagramr-notifications', JSON.stringify(notifications));
        console.log('Saving notification preferences to local storage:', notifications);
      } catch (e) {
        console.error('Error saving notifications to localStorage:', e);
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success("Signed out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // Store notification preferences in local storage
      localStorage.setItem('diagramr-notifications', JSON.stringify(notifications));
      
      toast.success("Notification settings updated");
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container max-w-4xl px-4 py-12">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </motion.div>
        
        <div className="space-y-8">
          {/* Profile section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="Your username"
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the name that will be displayed in greetings and throughout the app.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={email}
                    disabled
                    placeholder="Your email address"
                    className="max-w-md"
                  />
                </div>
                
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={isLoading || !userName.trim() || userName === profile?.username}
                  className="mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Notifications section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-updates">Email updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates about your account via email
                      </p>
                    </div>
                    <Switch 
                      id="email-updates" 
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, emailUpdates: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-features">New features</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new features and improvements
                      </p>
                    </div>
                    <Switch 
                      id="new-features" 
                      checked={notifications.newFeatures}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, newFeatures: checked})
                      }
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleSaveNotifications}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Account actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  {!profile?.is_premium && (
                    <Button 
                      variant="outline" 
                      className="justify-start text-left w-full sm:w-auto"
                      onClick={() => navigate("/pricing")}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-primary" />
                      Upgrade to Premium
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    className="justify-start text-left w-full sm:w-auto"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
