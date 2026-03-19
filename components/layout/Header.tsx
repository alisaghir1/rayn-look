'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
      scrolled 
        ? 'bg-white/98 border-gray-200 shadow-lg shadow-black/5' 
        : 'bg-white/95 border-gray-100'
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'
        }`}>
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-dark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className={`font-bold tracking-tight transition-all duration-300 ${
              scrolled ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-3xl'
            }`} style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="text-dark">RAYN</span>
              <span className="text-gradient-gold ml-1 group-hover:opacity-80 transition-opacity">LOOK</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link-fancy text-sm font-medium text-gray-700 hover:text-gold transition-colors uppercase tracking-widest"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative p-2 text-dark hover:text-gold transition-colors hover:scale-110 active:scale-95 duration-200"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-bounce-in">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slide-down">
            {navigation.map((item, i) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-sm font-medium text-gray-700 hover:text-gold transition-colors uppercase tracking-widest animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
