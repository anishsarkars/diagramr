
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Diagrams from './pages/Diagrams';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Authpage from './pages/Authpage';
import Account from './pages/Account';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import PaymentWebhookHandler from './pages/PaymentWebhookHandler';
import { AuthProvider } from './components/auth-context';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from "@/components/ui/toaster"
import { AccessProvider } from './components/access-context';

function App() {
  return (
    <AccessProvider>
      <ThemeProvider
        defaultTheme="light"
        storageKey="diagramr-theme"
      >
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diagrams" element={<Diagrams />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Authpage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/payment-webhook" element={<PaymentWebhookHandler />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </AccessProvider>
  );
}

export default App;
