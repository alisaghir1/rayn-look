'use client';

import { Shield, Truck, Award, Eye } from 'lucide-react';
import { useStaggerReveal } from '@/components/ui/ScrollReveal';

const badges = [
  { icon: Shield, label: 'FDA Approved', desc: 'Medical-grade safety certified', floatClass: 'badge-float-1' },
  { icon: Eye, label: 'Super Natural', desc: 'Undetectable natural look', floatClass: 'badge-float-2' },
  { icon: Truck, label: 'Worldwide Shipping', desc: 'Fast delivery to 30+ countries', floatClass: 'badge-float-3' },
  { icon: Award, label: 'Premium Quality', desc: 'Luxury comfort materials', floatClass: 'badge-float-4' },
];

export default function TrustBadges() {
  const ref = useStaggerReveal(120);
  return (
    <div className="flex justify-center">
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="group flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-500 hover:bg-gray-50 hover:shadow-lg hover:shadow-gold/5 cursor-default"
          >
            <div className={`${badge.floatClass} mb-4 p-3 rounded-xl bg-gold/5 group-hover:bg-gold/10 transition-colors duration-500`}>
              <badge.icon className="h-8 w-8 text-gold transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-dark">{badge.label}</p>
            <p className="text-xs text-gray-medium mt-1">{badge.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
