
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
  RefreshCw
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
    <footer className="bg-background border-t">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <DiagramrLogo size="md" />
            
            <p className="max-w-xs text-sm text-muted-foreground mt-4">
              Diagramr helps students, educators, and professionals discover and create 
              high-quality educational diagrams for better learning and knowledge sharing.
            </p>
            
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Mail className="h-5 w-5" />
              </Button>
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
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Heart className="h-3 w-3 text-red-500" />
                <span>Made with love for educators and learners</span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-8 text-center">
              <motion.div
                className="flex items-center gap-2 text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-medium">Learning Made Visual</span>
              </motion.div>
              
              <motion.div
                className="flex items-center gap-2 text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <RefreshCw className="h-4 w-4" />
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
      </div>
    </footer>
  );
}
