'use client';

import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe the element itself
    const revealClasses = ['reveal', 'reveal-left', 'reveal-right', 'reveal-scale', 'stagger-children'];
    const hasRevealClass = revealClasses.some((cls) => el.classList.contains(cls));
    if (hasRevealClass) {
      observer.observe(el);
    }

    // Also observe child elements with reveal classes
    const children = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

export function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  const ref = useScrollReveal<HTMLDivElement>(0.1);
  return <div ref={ref}>{children}</div>;
}
