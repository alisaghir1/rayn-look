'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  subtitle: string;
  title: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  bgGradient: string;
  bgImage: string;
}

// Fallback slides shown while loading or if DB is empty
const fallbackSlides: Slide[] = [
  {
    id: 'fallback-1',
    subtitle: 'Premium Contact Lenses',
    title: 'See the World',
    highlight: 'Through Luxury',
    description: 'Crafted for comfort. Designed for confidence. Discover contact lenses that redefine elegance.',
    ctaLabel: 'Shop Collection',
    ctaHref: '/shop',
    ctaSecondaryLabel: 'Our Story',
    ctaSecondaryHref: '/about',
    bgGradient: 'from-dark/95 via-dark/70 to-dark/40',
    bgImage: '/hero-bg.jpg',
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Fetch slides from API
  useEffect(() => {
    fetch('/api/hero-slides')
      .then((res) => res.json())
      .then((data) => {
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
          setCurrent(0);
        }
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback(
    (index: number, dir: 'next' | 'prev' = 'next') => {
      if (isAnimating) return;
      setIsAnimating(true);
      setDirection(dir);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 800);
    },
    [isAnimating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 'next');
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev');
  }, [current, goTo]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[100vh] min-h-[600px] max-h-[1000px] overflow-hidden bg-dark">
      {/* Background layers */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${s.bgGradient} z-10`} />
          <div
            className={`absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center transition-transform duration-[8000ms] ease-out ${
              i === current ? 'scale-110' : 'scale-100'
            }`}
            style={{ backgroundImage: `url('${s.bgImage}')` }}
          />
        </div>
      ))}

      {/* Decorative elements */}
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-gold/10 z-10 hidden lg:block animate-spin-slow" />
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gold/5 z-10 hidden lg:block animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div
            className={`max-w-2xl transition-all duration-700 ${
              isAnimating
                ? direction === 'next'
                  ? 'opacity-0 translate-y-8'
                  : 'opacity-0 -translate-y-8'
                : 'opacity-100 translate-y-0'
            }`}
          >
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-5 font-medium">
              {slide.subtitle}
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 font-lobster"
            >
              {slide.title}
              <br />
              <span className="text-gradient-gold">{slide.highlight}</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={slide.ctaHref}
                className="btn-gold inline-flex items-center gap-2 group"
              >
                {slide.ctaLabel}
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {slide.ctaSecondaryLabel && (
                <Link
                  href={slide.ctaSecondaryHref}
                  className="btn-outline-gold !border-white/30 !text-white hover:!bg-white hover:!text-dark"
                >
                  {slide.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 lg:left-8 z-30 hidden md:block">
        <button
          onClick={prev}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>
      <div className="absolute bottom-1/2 translate-y-1/2 right-4 lg:right-8 z-30 hidden md:block">
        <button
          onClick={next}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            className={`transition-all duration-500 rounded-full ${
              i === current
                ? 'w-10 h-2 bg-gold'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20" />

      {/* Scroll indicator */}
      <div className="absolute bottom-12 right-8 z-30 hidden lg:flex flex-col items-center gap-2">
        <span className="text-white/50 text-xs uppercase tracking-widest rotate-90 origin-center translate-y-8">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent mt-10 animate-pulse" />
      </div>
    </section>
  );
}
