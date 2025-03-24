
import { useState } from 'react';
import { useAccess } from './access-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { ArrowRight, Key, Lock, User, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

export function AccessCodeModal() {
  const { showAccessForm, setShowAccessForm, validateAccessCode } = useAccess();
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
        // Trigger confetti effect
        triggerConfetti();
        
        toast.success('Access granted! Welcome to Diagramr.');
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
      // In a real app, this would submit to a database
      // For demo, we'll just simulate a submission
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Diagramr Beta Access
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
                <Button type="submit" disabled={isValidating}>
                  {isValidating ? 'Validating...' : 'Verify Access'}
                  {!isValidating && <ArrowRight className="ml-2 h-4 w-4" />}
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
      </DialogContent>
    </Dialog>
  );
}
