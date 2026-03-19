'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}

const animationStyles: Record<AnimationType, { from: string; to: string }> = {
  'fade-up': {
    from: 'opacity-0 translate-y-10',
    to: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    from: 'opacity-0 -translate-y-10',
    to: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    from: 'opacity-0 translate-x-10',
    to: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    from: 'opacity-0 -translate-x-10',
    to: 'opacity-100 translate-x-0',
  },
  'scale': {
    from: 'opacity-0 scale-90',
    to: 'opacity-100 scale-100',
  },
  'blur': {
    from: 'opacity-0 blur-sm translate-y-6',
    to: 'opacity-100 blur-0 translate-y-0',
  },
  'none': {
    from: '',
    to: '',
  },
};

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = '',
  stagger = false,
  staggerDelay = 100,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (stagger) {
              const children = Array.from(el.children);
              children.forEach((child, i) => {
                const htmlChild = child as HTMLElement;
                setTimeout(() => {
                  htmlChild.style.opacity = '1';
                  htmlChild.style.transform = 'translateY(0) translateX(0) scale(1)';
                  htmlChild.style.filter = 'blur(0)';
                }, delay + i * staggerDelay);
              });
            } else {
              setTimeout(() => {
                el.classList.remove(...animationStyles[animation].from.split(' ').filter(Boolean));
                el.classList.add(...animationStyles[animation].to.split(' ').filter(Boolean));
              }, delay);
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, delay, threshold, stagger, staggerDelay]);

  const transitionStyle = {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  };

  if (stagger) {
    return (
      <div
        ref={ref}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${animationStyles[animation].from} ${className}`}
      style={transitionStyle}
    >
      {children}
    </div>
  );
}

/* Hook for stagger children - apply to parent, children get animated */
export function useStaggerReveal(staggerDelay = 100, threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(24px)';
      child.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            children.forEach((child, i) => {
              setTimeout(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, i * staggerDelay);
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerDelay, threshold]);

  return ref;
}
