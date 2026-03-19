'use client';

import { useState, useEffect } from 'react';
import { X, Instagram } from 'lucide-react';
import Image from 'next/image';

interface Celebrity {
  id: string;
  name: string;
  role: string;
  lensColor: string;
  image: string;
  quote: string;
  instagram: string;
  sortOrder: number;
}

export default function CelebrityGallery() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [selectedCeleb, setSelectedCeleb] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/celebrities')
      .then((res) => res.json())
      .then((data) => {
        if (data.celebrities) setCelebrities(data.celebrities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || celebrities.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gold blur-3xl animate-float-slow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">As Seen On</p>
          <h2
            className="text-3xl md:text-5xl font-bold text-dark mb-4 font-lobster"
          >
            Worn by <span className="text-gradient-gold">Celebrities</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mt-4">
            Trusted and loved by celebrities, influencers, and tastemakers across the Middle East and beyond.
          </p>
          <div className="divider-gold mt-6" />
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {celebrities.map((celeb, i) => (
            <button
              key={celeb.id}
              onClick={() => setSelectedCeleb(celeb)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 magnetic-hover cursor-pointer text-left"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Celebrity image or fallback */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                {celeb.image ? (
                  <Image src={celeb.image} alt={celeb.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                ) : (
                  <span className="text-7xl transition-transform duration-500 group-hover:scale-110">
                    🌟
                  </span>
                )}
              </div>

              {/* Gold border on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold/50 transition-all duration-500 z-20" />

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Instagram className="w-3.5 h-3.5 text-gold" />
                  <span className="text-gold text-xs">{celeb.instagram}</span>
                </div>
                <h3 className="text-white font-semibold text-base">{celeb.name}</h3>
                <p className="text-gray-300 text-xs mt-0.5">{celeb.role}</p>
                <p className="text-gold/70 text-xs uppercase tracking-wider mt-2">{celeb.lensColor}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Marquee text */}
        <div className="mt-16 overflow-hidden py-4 border-t border-b border-gray-100">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            {[...celebrities, ...celebrities].map((c, i) => (
              <span key={i} className="text-gray-200 text-xl font-bold uppercase tracking-widest flex items-center gap-4">
                {c.name}
                <span className="text-gold text-sm">★</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox modal */}
      {selectedCeleb && (
        <div
          className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedCeleb(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="relative h-64 bg-gradient-to-br from-dark to-dark/80 flex items-center justify-center overflow-hidden">
              {selectedCeleb.image ? (
                <Image src={selectedCeleb.image} alt={selectedCeleb.name} fill className="object-cover" sizes="500px" />
              ) : (
                <span className="text-9xl">🌟</span>
              )}
              <button
                onClick={() => setSelectedCeleb(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <Instagram className="w-4 h-4 text-gold" />
                <span className="text-gold text-sm">{selectedCeleb.instagram}</span>
              </div>
              <h3
                className="text-2xl font-bold text-dark mb-1 font-lobster"
              >
                {selectedCeleb.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{selectedCeleb.role}</p>
              <blockquote className="text-gray-600 italic border-l-2 border-gold pl-4 mb-6">
                &ldquo;{selectedCeleb.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gold uppercase tracking-wider font-medium">
                  Wearing: {selectedCeleb.lensColor}
                </span>
                <a
                  href="/shop"
                  className="btn-gold !py-2 !px-5 !text-xs"
                >
                  Shop This Look
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
