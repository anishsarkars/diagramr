import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container max-w-screen-xl py-16 px-4 relative">
        {/* Background decoration elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none"></div>

        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">Reset Your Password</h1>
          <p className="text-muted-foreground max-w-md mx-auto">We'll help you recover access to your account</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ForgotPasswordForm />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
} 