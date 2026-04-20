import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import HeroSlider from '@/components/ui/HeroSlider';
import TrustBadges from '@/components/ui/TrustBadges';
import Testimonials from '@/components/ui/Testimonials';
import CelebrityGallery from '@/components/ui/CelebrityGallery';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { HomeAnimationWrapper, StaggerGrid } from '@/components/ui/HomeAnimations';
import { supabaseAdmin } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Rayn Look — Premium Contact Lenses',
  description:
    'Discover luxury contact lenses crafted for comfort and style. Rayn Look offers premium colored lenses in monthly and yearly options with free shipping.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Rayn Look — Premium Contact Lenses',
    description: 'Discover luxury contact lenses crafted for comfort and style. Premium colored lenses with free shipping.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Rayn Look Premium Contact Lenses' }],
    type: 'website',
  },
};

export default async function HomePage() {
  const { data: categories } = await supabaseAdmin
    .from('Category')
    .select('name, slug, description, type')
    .eq('active', true)
    .order('sortOrder', { ascending: true });

  const allCategories = categories || [];

  return (
    <StorefrontLayout>
      <HomeAnimationWrapper>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Trust Badges */}
      <section className="py-14 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <ScrollReveal animation="fade-right" duration={900}>
              <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Since 2014</p>
              <h2
                className="text-3xl md:text-5xl font-bold text-dark mb-6 leading-tight font-lobster"
              >
                Our Journey From
                <br />
                <span className="text-gradient-gold">Nothing to Worldwide</span>
              </h2>
              <div className="divider-gold !ml-0 mb-8" />
              <p className="text-gray-600 leading-relaxed mb-4 text-lg">
                In 2014, founder <strong className="text-dark">Rayan</strong> started Rayn Look with nothing but a passion for quality and a vision to bring premium contact lenses to the world.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                From humble beginnings in Lebanon, we&apos;ve grown into a global brand — now serving customers in Lebanon, Iraq, and over 30 countries worldwide. Every lens carries our promise of luxury, comfort, and authenticity.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/about" className="btn-gold inline-block">
                  Read Our Full Story
                </Link>
                <Link href="/shop" className="btn-outline-gold inline-block">
                  Explore Collection
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200} duration={900}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-dark to-dark/80 overflow-hidden relative">
                  <Image
                    src="/rayn_2.jpg"
                    alt="Rayn Look — Premium Contact Lenses"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">Est. 2014</p>
                    <p
                      className="text-white text-3xl font-bold mt-2 font-lobster"
                    >
                      Rayn Look
                    </p>
                  </div>
                  {/* Decorative border */}
                  <div className="absolute inset-4 rounded-xl border border-gold/20" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-6 -left-6 bg-gold text-white rounded-2xl px-6 py-4 shadow-xl animate-float-slow">
                  <p className="text-2xl font-bold font-lobster">
                    <AnimatedCounter end={12} suffix="+" />
                  </p>
                  <p className="text-xs uppercase tracking-wider">Years of Excellence</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 lg:py-32 bg-gray-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Collections</p>
            <h2
              className="text-3xl md:text-5xl font-bold text-dark mb-4 font-lobster"
            >
              Shop by Category
            </h2>
            <div className="divider-gold mt-6" />
          </ScrollReveal>
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" delay={100}>
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100 magnetic-hover img-zoom"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors duration-500 z-10" />
                {/* Gold border on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold/40 transition-all duration-500 z-20" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <h3 className="text-white text-sm md:text-base font-semibold mb-1">{cat.name}</h3>
                  <p className="text-gray-300 text-xs line-clamp-2">{cat.description}</p>
                  <span className="inline-block mt-3 text-gold text-xs uppercase tracking-wider font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Best Sellers</p>
            <h2
              className="text-3xl md:text-5xl font-bold text-dark mb-4 font-lobster"
            >
              Featured Products
            </h2>
            <div className="divider-gold mt-6" />
          </ScrollReveal>
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" delay={120}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden magnetic-hover">
                <div className="animate-shimmer aspect-square rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="animate-shimmer h-4 rounded w-3/4" />
                  <div className="animate-shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </StaggerGrid>
          <ScrollReveal animation="fade-up" delay={400} className="text-center mt-12">
            <Link href="/shop" className="btn-outline-gold inline-block">
              View All Products
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Celebrity Gallery */}
      <CelebrityGallery />

      {/* Testimonials */}
      <Testimonials />

      {/* Why Rayn Look */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up" className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">The Rayn Difference</p>
            <h2
              className="text-3xl md:text-5xl font-bold text-dark mb-4 font-lobster"
            >
              Why Choose <span className="text-gradient-gold">Rayn Look</span>
            </h2>
            <div className="divider-gold mt-6" />
          </ScrollReveal>
          <StaggerGrid className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" delay={100}>
            {[
              {
                icon: '🔬',
                title: 'FDA Approved Materials',
                desc: 'Every lens is crafted with FDA-approved, medical-grade materials for maximum safety and comfort.',
              },
              {
                icon: '🎨',
                title: 'Natural Color Technology',
                desc: 'Our proprietary blending tech creates the most natural-looking colored lenses on the market.',
              },
              {
                icon: '💧',
                title: 'All-Day Hydration',
                desc: 'Advanced moisture-lock technology keeps your eyes comfortable from morning to night.',
              },
              {
                icon: '✈️',
                title: 'Worldwide Shipping',
                desc: 'From Lebanon and Iraq to 30+ countries — we deliver luxury to your doorstep.',
              },
              {
                icon: '🛡️',
                title: '30-Day Guarantee',
                desc: 'Not satisfied? Return within 30 days for a full refund. No questions asked.',
              },
              {
                icon: '💬',
                title: '24/7 WhatsApp Support',
                desc: 'Our team is always just a message away. Real support from real people.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group text-center p-8 rounded-2xl border border-gray-100 magnetic-hover hover:border-gold/30 bg-white"
              >
                <span className="text-5xl block mb-6 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">
                  {item.icon}
                </span>
                <h3 className="text-lg font-semibold text-dark mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Instagram Follow */}
      <section className="py-20 bg-gray-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="scale" className="text-center">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Follow Us</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-dark mb-2 font-lobster"
            >
              @rayn_look
            </h2>
            <p className="text-gray-500 mb-8">Join our community of 500K+ on Instagram</p>
            <a
              href="https://www.instagram.com/rayn_look/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-8 py-3 rounded-full font-semibold tracking-wide hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Follow on Instagram
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-dark text-white text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/10 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gold/5" style={{ animationDirection: 'reverse' }} />
        </div>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal animation="blur" duration={900}>
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-5">Luxury Awaits</p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-lobster"
            >
              Elevate Your Look Today
            </h2>
            <div className="divider-gold mb-8" />
            <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Join thousands who have discovered the perfect blend of comfort,
              style, and elegance with Rayn Look.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop" className="btn-gold">
                Shop Now
              </Link>
              <Link href="/contact" className="btn-outline-gold !border-white/30 !text-white hover:!bg-white hover:!text-dark">
                Contact Us
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* JSON-LD Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Rayn Look',
            url: 'https://www.raynlook.com',
            logo: 'https://www.raynlook.com/logo.png',
            description: 'Premium Contact Lenses — Since 2014',
            foundingDate: '2014',
            founder: {
              '@type': 'Person',
              name: 'Rayan',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-800-123-4567',
              contactType: 'customer service',
            },
            sameAs: [
              'https://www.instagram.com/rayn_look/',
              'https://www.facebook.com/rayn.look/',
              'https://www.tiktok.com/@rayn_look_lenses',
            ],
          }),
        }}
      />
      </HomeAnimationWrapper>
    </StorefrontLayout>
  );
}
