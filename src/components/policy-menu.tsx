import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const PolicyMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const policies = [
    { path: '/terms', label: 'Terms & Conditions' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/refund', label: 'Refund Policy' },
  ];

  const currentPolicy = policies.find(policy => policy.path === location.pathname);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentPolicy?.label || 'Policies'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-card shadow-lg border border-border/50 overflow-hidden z-50"
          >
            {policies.map((policy) => (
              <Link
                key={policy.path}
                to={policy.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors ${
                  location.pathname === policy.path ? 'bg-primary/5 font-medium' : ''
                }`}
              >
                {policy.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyMenu; 