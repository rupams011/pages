"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 relative overflow-hidden">
         {/* Glass effect background */}
         <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm -z-10"></div>
        
        <div className="space-y-2">
          <h3 className="font-bold text-lg">We use cookies 🍪</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We use cookies to improve your experience and personalize ads. By using our site, you consent to our use of cookies.
          </p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2.5 px-4 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
           {/* Link to Privacy Policy */}
           <Link 
            href="/cookies"
            className="flex-1 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
