
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, PhoneForwarded } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send the feedback to WhatsApp via a direct link
      const whatsappNumber = "919589534294";
      const message = `Diagramr Feedback:\n${feedback}${email ? `\nContact: ${email}` : ''}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappURL, '_blank');
      
      toast.success('Thank you for your feedback! We appreciate your help improving Diagramr.');
      setFeedback('');
      setEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50"
      >
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => setIsOpen(true)} 
          className="shadow-md bg-primary text-white hover:bg-primary/90 px-3 py-5 rounded-r-none rounded-l-md flex flex-col items-center justify-center gap-2 h-auto"
          aria-label="Provide feedback"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-[10px] font-medium rotate-90 mt-1 tracking-wider">FEEDBACK</span>
        </Button>
      </motion.div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>
              Help us improve Diagramr by sharing your experience, reporting issues, or suggesting features.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">We'll only use this to follow up on your feedback if needed.</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="feedback" className="required">Feedback</Label>
              <Textarea 
                id="feedback" 
                placeholder="Tell us about your experience, report a bug, or suggest an improvement..." 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="resize-none"
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto group"
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    Send feedback
                    <span className="ml-2 inline-flex items-center">
                      <PhoneForwarded className="h-4 w-4 mr-1" />
                      <span className="text-xs">via WhatsApp</span>
                    </span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
