
import { DiagramrLogo } from "@/components/diagramr-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart,
  BookOpen,
  Users,
  BarChart,
  Lightbulb,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Home", href: "/" },
        { name: "Pricing", href: "/pricing" },
        { name: "Upgrade to Premium", href: "/pricing" },
        { name: "API (Coming Soon)", href: "#" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Educational Diagrams", href: "/" },
        { name: "Study Guide", href: "#" },
        { name: "Blog", href: "#" },
        { name: "FAQs", href: "#" },
      ]
    },
    {
      title: "Account",
      links: [
        { name: "My Account", href: "/account" },
        { name: "Saved Diagrams", href: "/liked" },
        { name: "Settings", href: "/account" },
        { name: "Get Help", href: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Privacy", href: "#" },
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-background border-t relative overflow-hidden">
      {/* 3D-like gradient decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container px-4 py-12 mx-auto relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <DiagramrLogo size="md" />
            
            <p className="max-w-xs text-sm text-muted-foreground mt-4">
              Diagramr helps students, educators, professionals, and businesses discover and create 
              high-quality diagrams for learning, presentations, research, and business documentation.
            </p>
            
            <div className="flex space-x-3">
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 500 }}>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Twitter className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 500 }}>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Github className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 500 }}>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 500 }}>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Mail className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            className="col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-3">
                <motion.h3 variants={item} className="text-sm font-medium">
                  {group.title}
                </motion.h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <motion.li variants={item} key={link.name}>
                      <Link 
                        to={link.href} 
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex justify-center md:justify-start">
              <motion.div 
                className="flex items-center space-x-1 text-sm text-muted-foreground"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Heart className="h-3 w-3 text-red-500" />
                <span>Built with 💖 by <span className="font-semibold">@Anish</span></span>
              </motion.div>
            </div>
            
            <div className="flex justify-center space-x-8 text-center">
              <motion.div
                className="flex items-center gap-2 text-muted-foreground"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">Premium Quality</span>
              </motion.div>
              
              <motion.div
                className="flex items-center gap-2 text-muted-foreground"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <RefreshCw className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Daily Updates</span>
              </motion.div>
            </div>
            
            <div className="flex justify-center md:justify-end">
              <p className="text-sm text-muted-foreground">
                &copy; {currentYear} Diagramr. All rights reserved.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground/70 italic">
            Diagramr is in the initial stages of development. Results may occasionally vary in quality.
            We're constantly improving to deliver the best experience for our users.
          </p>
        </div>
      </div>
    </footer>
  );
}
