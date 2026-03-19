'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  title: string;
  text: string;
  product: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(Math.max(0, Math.min(index, maxIndex)));
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, maxIndex]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex, testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-dark text-white overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute top-20 left-10 text-gold/5">
        <Quote className="w-40 h-40" />
      </div>
      <div className="absolute bottom-20 right-10 text-gold/5 rotate-180">
        <Quote className="w-40 h-40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Testimonials</p>
          <h2
            className="text-3xl md:text-5xl font-bold mb-4 font-lobster"
          >
            What Our Clients <span className="text-gradient-gold">Say</span>
          </h2>
          <div className="divider-gold mt-6" />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${current * (100 / itemsPerView)}%)` }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="glass-card rounded-2xl p-8 h-full flex flex-col hover:border-gold/30 transition-all duration-500">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-3">{t.title}</h3>

                    {/* Text */}
                    <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

                    {/* Product */}
                    <p className="text-gold/70 text-xs uppercase tracking-wider mt-4 mb-5">{t.product}</p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                      <span className="text-3xl">{t.avatar}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              disabled={current === 0}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-gold hover:border-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-white/20 transition-all duration-300"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to testimonial group ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={current >= maxIndex}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-gold hover:border-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-white/20 transition-all duration-300"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/10 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-gradient-gold font-lobster">
              <AnimatedCounter end={10} suffix="K+" duration={2000} />
            </p>
            <p className="text-gray-400 text-sm mt-2">Happy Customers</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-gradient-gold font-lobster">
              <AnimatedCounter end={49} prefix="" suffix="" duration={2000} />
            </p>
            <p className="text-gray-400 text-sm mt-2">Average Rating (4.9)</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-gradient-gold font-lobster">
              <AnimatedCounter end={30} suffix="+" duration={2000} />
            </p>
            <p className="text-gray-400 text-sm mt-2">Countries Worldwide</p>
          </div>
        </div>
      </div>
    </section>
  );
}
