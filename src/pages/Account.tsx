
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  User, 
  Settings, 
  Lock, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut, 
  Check,
  X,
  Loader2
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

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>{profile?.username || user.email}</span>
                </div>
              </CardTitle>
              <CardDescription>
                {profile?.is_premium ? (
                  <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                    Premium Account
                  </Badge>
                ) : (
                  <Badge variant="outline">Free Account</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-accent cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-accent cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-accent cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Subscription</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-accent cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <Lock className="h-4 w-4" />
                  <span>Security</span>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign out</span>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Main content */}
          <Card className="md:col-span-2">
            <Tabs defaultValue="profile">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account Settings</CardTitle>
                  <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="m-0">
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      placeholder="Your username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={email}
                      disabled
                      placeholder="Your email address"
                    />
                    <p className="text-xs text-muted-foreground">
                      To change your email, please contact support.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdateProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications" className="m-0">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-updates">Email Updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive email notifications about your account
                      </p>
                    </div>
                    <Switch 
                      id="email-updates" 
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailUpdates: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-features">New Features</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new features and improvements
                      </p>
                    </div>
                    <Switch 
                      id="new-features" 
                      checked={notifications.newFeatures}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, newFeatures: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="search-alerts">Search Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts for saved searches
                      </p>
                    </div>
                    <Switch 
                      id="search-alerts"
                      checked={notifications.searchAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, searchAlerts: checked }))
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="default">Save Notification Settings</Button>
                </CardFooter>
              </TabsContent>
              
              {/* Subscription Tab */}
              <TabsContent value="subscription" className="m-0">
                <CardContent className="space-y-4 pt-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">
                        {profile?.is_premium ? "Premium Plan" : "Free Plan"}
                      </h3>
                      {profile?.is_premium ? (
                        <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free Tier</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>
                          {profile?.is_premium 
                            ? "Unlimited searches per day" 
                            : "5 searches per day"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>
                          {profile?.is_premium 
                            ? "20 AI diagram generations per day" 
                            : "1 AI diagram generation per day"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {profile?.is_premium ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Save unlimited diagrams</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Save unlimited diagrams</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!profile?.is_premium && (
                    <Button variant="default" className="w-full" onClick={() => navigate('/pricing')}>
                      Upgrade to Premium
                    </Button>
                  )}
                  
                  {profile?.is_premium && (
                    <div className="text-sm text-muted-foreground">
                      Your premium plan renews on <span className="font-medium">May 15, 2024</span>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
