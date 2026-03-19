import type { Metadata } from 'next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import FAQAccordion from './FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Rayn Look premium contact lenses.',
  alternates: { canonical: '/faq' },
};

export default function FAQPage() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="bg-dark text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-gold/10 animate-spin-slow hidden lg:block" />
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[250px] h-[250px] rounded-full border border-gold/5 animate-spin-slow hidden lg:block" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">Got Questions?</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-lobster animate-slide-up">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            Everything you need to know about our premium contact lenses.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FAQAccordion />

          {/* Still have questions */}
          <div className="mt-16 text-center bg-gray-50 rounded-2xl p-10">
            <p className="text-2xl font-bold text-dark mb-3 font-lobster">Still have questions?</p>
            <p className="text-gray-500 mb-6">We&apos;re here to help. Reach out to us anytime.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="btn-gold inline-block">Contact Us</a>
              <a
                href="https://wa.me/96170123456"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold inline-block"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
