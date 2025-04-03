
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
      
      toast.success('Thank you for your feedback!');
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
        className="fixed right-0 bottom-1/4 transform z-50 opacity-70 hover:opacity-100 transition-opacity"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(true)} 
          className="shadow-sm bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-l-md rounded-r-none flex items-center justify-center h-auto"
          aria-label="Provide feedback"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </motion.div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>
              Help us improve Diagramr by sharing your experience.
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
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="feedback" className="required">Feedback</Label>
              <Textarea 
                id="feedback" 
                placeholder="Tell us about your experience..." 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none"
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Sending...' : 'Send feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
