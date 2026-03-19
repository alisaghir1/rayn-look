'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="mx-auto max-w-4xl bg-dark text-white rounded-2xl shadow-2xl border border-gold/10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="shrink-0 p-2 rounded-xl bg-gold/10">
          <Cookie className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300 leading-relaxed">
            We use cookies to enhance your shopping experience and analyze site traffic.
            By clicking &quot;Accept&quot;, you consent to our use of cookies.{' '}
            <Link href="/privacy" className="text-gold hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="btn-gold py-2! px-5! text-xs!"
          >
            Accept
          </button>
        </div>
        <button
          onClick={decline}
          className="absolute top-3 right-3 sm:hidden text-gray-500 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
