'use client';

import { type ReactNode } from 'react';
import ScrollProgress, { CursorGlow } from '@/components/ui/ScrollEffects';
import { useStaggerReveal } from '@/components/ui/ScrollReveal';

export function HomeAnimationWrapper({ children }: { children: ReactNode }) {
  return (
    <CursorGlow>
      <ScrollProgress />
      {children}
    </CursorGlow>
  );
}

export function StaggerGrid({
  children,
  className = '',
  delay = 80,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useStaggerReveal(delay);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
