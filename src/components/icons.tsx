
import { 
  AlertCircle, 
  ArrowRight, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Command, 
  CreditCard, 
  File, 
  FileText, 
  HelpCircle, 
  Image, 
  Laptop, 
  Loader2, 
  Moon, 
  MoreVertical, 
  Pizza, 
  Plus, 
  Settings, 
  SunMedium, 
  Trash, 
  Twitter, 
  User, 
  X,
  Github,
} from "lucide-react";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertCircle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  sparkles: Sparkles,
  gitHub: Github,
  check: Check,
  twitter: Twitter,
  file: File,
  fileText: FileText,
  image: Image,
  google: ({ ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
    </svg>
  ),
};
