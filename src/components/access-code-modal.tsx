
import { useState, useEffect } from 'react';
import { useAccess } from './access-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { ArrowRight, Key, Lock, User, Phone, Crown, Sparkles, Gift, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth-context';
import { motion } from 'framer-motion';

export function AccessCodeModal() {
  const { showAccessForm, setShowAccessForm, validateAccessCode, hasValidAccessCode, isPremiumUser, isAnishInvite } = useAccess();
  const { user } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('access-code');
  
  // Waitlist form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }
    
    setIsValidating(true);
    
    try {
      const isValid = await validateAccessCode(accessCode);
      
      if (isValid) {
        if (accessCode.toUpperCase() === "DIA2025") {
          // Premium code celebration happens in context
          // No additional action needed here as it's handled in the context
        } else {
          // Trigger regular confetti effect
          triggerConfetti();
          toast.success('Access granted! Welcome to Diagramr.');
        }
        
        setShowAccessForm(false);
      } else {
        toast.error('Invalid access code. Please try again or join the waitlist.');
      }
    } catch (error) {
      console.error('Error validating access code:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleSubmitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast.error('Please provide both your name and phone number');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send the feedback to WhatsApp via a direct link
      const whatsappNumber = "+919589534294";
      const message = `New Diagramr Waitlist Request:\nName: ${name}\nPhone: ${phone}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappURL, '_blank');
      
      toast.success('You have been added to the waitlist! We will contact you soon.');
      setName('');
      setPhone('');
      setShowAccessForm(false);
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <Dialog open={showAccessForm} onOpenChange={setShowAccessForm}>
      <DialogContent className={`sm:max-w-md ${isPremiumUser ? 'bg-gradient-to-b from-background to-background/90 border-purple-300/20' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAnishInvite ? (
              <>
                <Gift className="h-5 w-5 text-amber-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
                  @Anish's Personal Invite
                </span>
              </>
            ) : isPremiumUser ? (
              <>
                <Crown className="h-5 w-5 text-amber-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
                  Diagramr Exclusive Beta
                </span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-primary" />
                Diagramr Beta Access
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Due to API limitations, Diagramr is currently in private beta. Enter your access code or join the waitlist to get notified when we have availability.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access-code">Access Code</TabsTrigger>
            <TabsTrigger value="waitlist">Join Waitlist</TabsTrigger>
          </TabsList>
          
          <TabsContent value="access-code" className="mt-4">
            <form onSubmit={handleSubmitAccessCode}>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="access-code" className="flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" />
                    Access Code
                  </Label>
                  <Input
                    id="access-code"
                    placeholder="Enter your access code..."
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="text-center tracking-wider"
                    autoComplete="off"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Need an access code? Contact <a href="https://wa.link/g46cv1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Anish</a> to request access.
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isValidating} className="group">
                  {isValidating ? 'Validating...' : 'Verify Access'}
                  {!isValidating && (
                    <motion.div 
                      className="inline-flex ml-2"
                      initial={{ x: 0 }}
                      animate={{ x: [0, 5, 0] }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "mirror",
                        duration: 1, 
                        repeatDelay: 1 
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="waitlist" className="mt-4">
            <form onSubmit={handleSubmitWaitlist}>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
        
        {isPremiumUser && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-2 right-2"
          >
            <Sparkles className="h-5 w-5 text-amber-400 opacity-70" />
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
