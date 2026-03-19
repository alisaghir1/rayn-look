import type { Metadata } from 'next';
import { Shield, FileText, Lock, Users, RefreshCw } from 'lucide-react';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { StaggerGrid } from '@/components/ui/HomeAnimations';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Rayn Look collects, uses, and protects your personal information. Your privacy matters to us.',
  alternates: { canonical: '/privacy' },
};

const sections = [
  {
    icon: Users,
    title: 'Personal Information',
    content:
      'At Rayn Look, we collect personal information only when necessary for processing your orders and inquiries. This includes your name, contact details, and payment information. We ensure that all collected data is used solely for enhancing your shopping experience and fulfilling your orders efficiently.',
  },
  {
    icon: FileText,
    title: 'No Returns Policy',
    content:
      'As our products are considered medical in nature, we are unable to accept returns. Once your purchase is made, it cannot be returned due to health and hygiene regulations. This policy ensures the safety and hygiene standards required for contact lens products.',
  },
  {
    icon: Lock,
    title: 'Data Security',
    content:
      'We are committed to protecting your personal information. Your data is securely stored using industry-standard encryption protocols to safeguard your privacy. We implement multiple layers of security and regularly update our systems to protect against unauthorized access.',
  },
  {
    icon: Shield,
    title: 'Sharing Your Information',
    content:
      'We may share your personal information with trusted third-party service providers solely for the purpose of fulfilling your orders. These services include payment processing and shipping. All third-party services we use are committed to keeping your data confidential and secure.',
  },
  {
    icon: RefreshCw,
    title: 'Changes to This Policy',
    content:
      'Rayn Look reserves the right to update this Privacy Policy at any time. Any changes will be posted on this page, and we encourage you to review this policy periodically for any updates. We will notify users of significant changes via email when possible.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="bg-dark text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gold/10 animate-spin-slow hidden lg:block" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">Legal</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-lobster animate-slide-up">
            Privacy <span className="text-gradient-gold">Policy</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <StaggerGrid className="space-y-8" delay={120}>
            {sections.map((section, i) => (
              <div
                key={section.title}
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 lg:p-10 magnetic-hover hover:border-gold/30 transition-all duration-500"
              >
                {/* Number badge */}
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

          {/* Last updated */}
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
