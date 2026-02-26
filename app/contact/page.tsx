import type { Metadata } from 'next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Rayn Look. We\'re here to help with orders, product questions, and more.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="bg-dark text-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Get in Touch</p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-lobster"
          >
            Contact <span className="text-gradient-gold">Us</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact info */}
            <div>
              <h2
                className="text-2xl font-bold text-dark mb-8 font-lobster"
              >
                Reach Out to Us
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">Email</h3>
                  <p className="text-gray-600">info@raynlook.com</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">Phone</h3>
                  <p className="text-gray-600">+1 (800) 123-4567</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">Address</h3>
                  <p className="text-gray-600">123 Luxury Lane<br />Beverly Hills, CA 90210</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">Business Hours</h3>
                  <p className="text-gray-600">Monday — Friday: 9am – 6pm PST<br />Saturday — Sunday: 10am – 4pm PST</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
