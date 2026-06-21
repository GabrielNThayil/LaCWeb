"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay to avoid flashing on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl border border-crown-espresso/10 shadow-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-crown-espresso/10 flex items-center justify-center shrink-0">
            <Cookie className="w-6 h-6 text-crown-gold" />
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-crown-espresso mb-1">
              We value your privacy
            </h3>
            <p className="text-sm text-crown-espresso/60 mb-4">
              We use cookies to enhance your browsing experience and analyze site traffic.
              By clicking accept, you consent to our use of cookies.{' '}
              <Link href="/privacy" className="text-crown-espresso underline hover:text-crown-caramel">
                Learn more
              </Link>
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 rounded-full bg-crown-espresso text-crown-paper text-sm font-medium hover:bg-crown-caramel transition-colors"
              >
                Accept All Cookies
              </button>
              <button
                onClick={acceptEssential}
                className="px-5 py-2.5 rounded-full border border-crown-espresso/20 text-crown-espresso text-sm font-medium hover:bg-crown-espresso/5 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>

          <button
            onClick={acceptEssential}
            className="absolute top-4 right-4 md:relative md:top-auto md:right-auto p-2 rounded-full hover:bg-crown-espresso/5 transition-colors"
            aria-label="Close cookie consent"
          >
            <X className="w-5 h-5 text-crown-espresso/40" />
          </button>
        </div>
      </div>
    </div>
  );
}