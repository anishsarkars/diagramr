
import { Logo } from "@/components/logo";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import {
  Heart,
  Coffee,
  Github,
  Twitter,
  LinkedinIcon,
  BookOpen,
  Home,
  Sparkles,
  Layers,
  Database,
  HelpCircle,
  BarChart,
  LayoutGrid,
  Info,
  GraduationCap
} from "lucide-react";

export function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Home", href: "/", icon: Home },
        { name: "Diagram Search", href: "/", icon: LayoutGrid },
        { name: "AI Generation", href: "/", icon: Sparkles },
        { name: "Pricing", href: "/pricing", icon: BarChart }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Learning", href: "#", icon: BookOpen },
        { name: "Templates", href: "#", icon: Layers },
        { name: "Data Science", href: "#", icon: Database },
        { name: "Education", href: "#", icon: GraduationCap }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#", icon: Info },
        { name: "Help", href: "#", icon: HelpCircle },
        { name: "Account", href: user ? "/account" : "/auth", icon: Database }
      ]
    }
  ];

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="mt-auto border-t py-8 md:py-12 relative overflow-hidden">
      {/* 3D background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.08),transparent_70%)]" />
      
      <div className="container relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="md:col-span-4 space-y-4">
            <DiagramrLogo showBeta={false} size="lg" />
            <p className="text-muted-foreground text-sm max-w-xs">
              Diagramr helps students, educators, and professionals find and create high-quality visual diagrams for learning, presentations, and development.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <motion.a 
                href="https://github.com" 
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://linkedin.com/in/anishsarkar-" 
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <LinkedinIcon className="h-5 w-5" />
              </motion.a>
              <ThemeToggle />
            </div>
          </div>
          
          {footerLinks.map((group, i) => (
            <div key={group.title} className="md:col-span-2 space-y-4">
              <p className="font-medium text-sm">{group.title}</p>
              <ul className="space-y-2">
                {group.links.map((link, j) => (
                  <motion.li key={link.name} variants={linkVariants}>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-muted-foreground hover:text-foreground flex items-center gap-2"
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      <span>{link.name}</span>
                    </Button>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="md:col-span-2 space-y-4">
            <p className="font-medium text-sm">Try Premium</p>
            <Button
              className="gap-2"
              onClick={() => navigate("/pricing")}
            >
              <Sparkles className="h-4 w-4" />
              <span>Upgrade</span>
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
              Get unlimited searches and generations with our premium plan.
            </p>
          </div>
        </motion.div>

        <Separator className="my-8 bg-border/50" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Diagramr. Made with</span>
            <motion.span 
              whileHover={{ scale: 1.2 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, repeatType: "mirror", duration: 2 }}
            >
              <Heart className="h-4 w-4 text-red-500 inline" />
            </motion.span>
            <span>by <a 
              href="https://www.linkedin.com/in/anishsarkar-/" 
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:underline text-foreground/90"
            >
              @Anish
            </a></span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <motion.a 
              whileHover={{ y: -2 }}
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Terms
            </motion.a>
            <motion.a 
              whileHover={{ y: -2 }}
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </motion.a>
            <motion.a 
              whileHover={{ y: -2 }}
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Cookies
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1 }}
              href="https://www.buymeacoffee.com" 
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Coffee className="h-4 w-4" />
              <span>Buy me a coffee</span>
            </motion.a>
          </div>
        </div>
        
        <motion.div 
          className="mt-6 text-center text-xs text-muted-foreground/70 italic"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Diagramr is currently in beta. We're constantly improving our services. Your feedback is valuable to us.
        </motion.div>
      </div>
    </footer>
  );
}
