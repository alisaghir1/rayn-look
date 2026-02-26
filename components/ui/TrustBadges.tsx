import { Shield, Truck, Award } from 'lucide-react';

const badges = [
  { icon: Shield, label: 'FDA Approved', desc: 'Safety certified' },
  { icon: Truck, label: 'Worldwide Shipping', desc: 'Delivery everywhere' },
  { icon: Award, label: 'Premium Quality', desc: 'Luxury materials' },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {badges.map((badge) => (
        <div key={badge.label} className="flex flex-col items-center text-center p-4">
          <badge.icon className="h-8 w-8 text-gold mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-dark">{badge.label}</p>
          <p className="text-xs text-gray-medium mt-1">{badge.desc}</p>
        </div>
      ))}
    </div>
  );
}
