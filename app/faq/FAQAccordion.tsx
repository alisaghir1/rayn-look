'use client';

import { useState } from 'react';
import { Clock, Award, Heart, Eye, Wrench, UserCheck, Shield, Moon, ChevronDown } from 'lucide-react';
import { useStaggerReveal } from '@/components/ui/ScrollReveal';

const faqs = [
  {
    icon: Clock,
    question: 'What is the lifespan of your contact lenses?',
    answer:
      'Our premium contact lenses are designed to last for up to one year with proper care and maintenance. They offer long-lasting comfort and clarity throughout their lifespan. For optimal performance, follow our care instructions and replace them when recommended.',
  },
  {
    icon: Award,
    question: 'Are your contact lenses certified?',
    answer:
      'Yes, our contact lenses are certified to meet the highest international standards for safety and quality. We hold certifications from leading regulatory bodies and prioritize your eye health above all. Each batch undergoes rigorous testing before reaching you.',
  },
  {
    icon: Heart,
    question: 'How comfortable are your contact lenses?',
    answer:
      'Our contact lenses are engineered for maximum comfort, offering a natural feel throughout the day. They feature advanced breathable materials that allow optimal oxygen flow to your eyes, preventing dryness and irritation even during extended wear.',
  },
  {
    icon: Eye,
    question: 'Do your lenses look natural on the eye?',
    answer:
      'Absolutely! Our lenses are designed to enhance the natural beauty of your eyes with a flawless, seamless look. They blend perfectly with your iris using advanced color-matching technology, creating an undetectable, naturally beautiful appearance.',
  },
  {
    icon: Wrench,
    question: 'How do I care for my contact lenses?',
    answer:
      'Proper care is essential for maintaining lens clarity and comfort. Always use fresh contact solution, never water. Clean and store your lenses in their case after each use. Replace the solution daily and avoid wearing lenses for more than 8-10 hours continuously.',
  },
  {
    icon: UserCheck,
    question: 'Can I wear these lenses if I have a prescription?',
    answer:
      'Yes, our lenses are available with prescription options for various vision needs. We offer corrective lenses for nearsightedness, farsightedness, and astigmatism. Consult with your eye care professional to determine the right prescription strength for you.',
  },
  {
    icon: Shield,
    question: 'Are your lenses safe for long-term wear?',
    answer:
      'Our lenses are designed for safe, long-term wear when used as directed. They\'re made from biocompatible materials that are gentle on your eyes. Follow proper hygiene practices and care instructions to ensure safe, comfortable long-term use.',
  },
  {
    icon: Moon,
    question: 'Can I sleep while wearing these lenses?',
    answer:
      'It\'s not recommended to sleep in contact lenses unless they\'re specifically designed for overnight wear. Our standard lenses should be removed before sleeping to allow your eyes to rest and breathe naturally. Always consult your eye care professional for personalized advice.',
  },
];

function FAQItem({ faq, isOpen, onToggle }: {
  faq: typeof faqs[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = faq.icon;
  return (
    <div
      className={`group rounded-2xl border transition-all duration-500 overflow-hidden ${
        isOpen
          ? 'border-gold/30 bg-white shadow-lg shadow-gold/5'
          : 'border-gray-100 bg-white hover:border-gold/20 magnetic-hover'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-6 lg:p-8 text-left cursor-pointer"
      >
        <div className={`shrink-0 p-3 rounded-xl transition-colors duration-500 ${
          isOpen ? 'bg-gold/15' : 'bg-gold/5 group-hover:bg-gold/10'
        }`}>
          <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base lg:text-lg font-semibold text-dark pr-4">{faq.question}</h3>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gold shrink-0 transition-transform duration-500 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 lg:px-8 pb-6 lg:pb-8 pl-[88px] lg:pl-[104px]">
          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useStaggerReveal(100);

  return (
    <div ref={ref} className="space-y-4">
      {faqs.map((faq, i) => (
        <FAQItem
          key={faq.question}
          faq={faq}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
