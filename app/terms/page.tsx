import type { Metadata } from 'next';
import { Scale, ShoppingBag, CreditCard, Truck, AlertTriangle, Globe, RefreshCw } from 'lucide-react';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { StaggerGrid } from '@/components/ui/HomeAnimations';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions for using the Rayn Look website and purchasing our products.',
  alternates: { canonical: '/terms' },
};

const sections = [
  {
    icon: Scale,
    title: 'General Terms',
    content:
      'By accessing and using the Rayn Look website, you agree to be bound by these Terms of Service. These terms govern your use of our website, products, and services. If you do not agree with any part of these terms, please refrain from using our website.',
  },
  {
    icon: ShoppingBag,
    title: 'Products & Orders',
    content:
      'All products listed on our website are subject to availability. We reserve the right to limit quantities and discontinue products at any time. Prices are subject to change without notice. Orders are confirmed only after successful payment processing.',
  },
  {
    icon: CreditCard,
    title: 'Payment & Pricing',
    content:
      'We accept major credit cards, debit cards, and other payment methods as displayed at checkout. All prices are listed in USD unless otherwise stated. You agree to provide accurate payment information and authorize us to charge the total amount of your order.',
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    content:
      'We ship to over 30 countries worldwide. Shipping times vary depending on your location. We are not responsible for customs duties or import taxes. Delivery estimates are approximate and not guaranteed. Risk of loss transfers to you upon delivery to the carrier.',
  },
  {
    icon: AlertTriangle,
    title: 'No Returns or Exchanges',
    content:
      'Due to the medical nature of contact lenses and for hygiene and safety reasons, all sales are final. We are unable to accept returns, exchanges, or refunds once an order has been placed and confirmed. Please ensure you select the correct product before purchasing.',
  },
  {
    icon: Globe,
    title: 'Intellectual Property',
    content:
      'All content on this website, including text, images, logos, and designs, is the property of Rayn Look and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.',
  },
];

export default function TermsPage() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="bg-dark text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gold/10 animate-spin-slow hidden lg:block" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">Legal</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-lobster animate-slide-up">
            Terms of <span className="text-gradient-gold">Service</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            Please read these terms carefully before using our website or making a purchase.
          </p>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <StaggerGrid className="space-y-8" delay={120}>
            {sections.map((section, i) => (
              <div
                key={section.title}
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 lg:p-10 magnetic-hover hover:border-gold/30 transition-all duration-500"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gold text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                  {i + 1}
                </div>
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gold/5 group-hover:bg-gold/10 transition-colors duration-500">
                    <section.icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-dark mb-3 font-lobster">{section.title}</h2>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerGrid>

          <ScrollReveal animation="fade-up" delay={200} className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-6 py-3 rounded-full">
              <RefreshCw className="h-4 w-4" />
              Last updated: March 2026
            </div>
          </ScrollReveal>
        </div>
      </section>
    </StorefrontLayout>
  );
}
