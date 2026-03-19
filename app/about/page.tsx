import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import TrustBadges from '@/components/ui/TrustBadges';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { StaggerGrid } from '@/components/ui/HomeAnimations';

export const metadata: Metadata = {
  title: 'About Us — Our Story Since 2014',
  description:
    'Founded in 2014 by Rayan, Rayn Look grew from nothing to a global premium contact lens brand — now serving customers in Lebanon, Iraq, and 30+ countries worldwide.',
  alternates: { canonical: '/about' },
};

const milestones = [
  { year: '2014', title: 'The Beginning', desc: 'Rayan founded Rayn Look with nothing but a vision — to bring premium, luxury contact lenses to everyone.' },
  { year: '2016', title: 'Lebanon Launch', desc: 'Officially launched across Lebanon, quickly becoming the go-to brand for quality colored lenses.' },
  { year: '2018', title: 'Going Digital', desc: 'Launched our e-commerce platform, bringing Rayn Look lenses to customers across the Middle East.' },
  { year: '2020', title: 'Worldwide Reach', desc: 'Expanded to 20+ countries with international shipping and a growing community of loyal customers.' },
  { year: '2022', title: '10,000+ Customers', desc: 'Celebrated a major milestone with 10,000+ happy customers and 30+ countries served worldwide.' },
  { year: '2024', title: 'Expanding to Iraq', desc: 'Entered the Iraqi market with a network of retailers and direct-to-customer online sales.' },
  { year: '2026', title: 'The Future', desc: 'Continuing to innovate with new lens technologies, colors, and an even more premium experience.' },
];

export default function AboutPage() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative bg-dark text-white py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-gold/10 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-gold/5" style={{ animationDirection: 'reverse' }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-5 font-medium">Since 2014</p>
          <h1
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight font-lobster"
          >
            The Story Behind
            <br />
            <span className="text-gradient-gold">Rayn Look</span>
          </h1>
          <div className="divider-gold mb-8" />
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            From a dream born in 2014 to a worldwide luxury brand — this is our journey.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Photo placeholder */}
            <ScrollReveal animation="fade-right" duration={900} className="relative order-2 md:order-1">
              <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-dark via-dark/90 to-dark/70 overflow-hidden relative">
                <Image
                  src="/rayn.jpg"
                  alt="Rayan — Founder of Rayn Look"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <p
                    className="text-white text-2xl font-bold font-lobster"
                  >
                    Rayan
                  </p>
                  <p className="text-gold text-sm uppercase tracking-widest mt-1">Founder & CEO</p>
                </div>
                <div className="absolute inset-6 rounded-2xl border border-gold/15" />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gold text-white rounded-2xl px-5 py-3 shadow-xl animate-float-slow">
                <p className="text-xl font-bold font-lobster"><AnimatedCounter end={12} suffix="+" /></p>
                <p className="text-xs uppercase tracking-wider">Years</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-dark text-white rounded-2xl px-5 py-3 shadow-xl border border-gold/20 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                <p className="text-xl font-bold font-lobster"><AnimatedCounter end={30} suffix="+" /></p>
                <p className="text-xs uppercase tracking-wider">Countries</p>
              </div>
            </ScrollReveal>

            {/* Story */}
            <ScrollReveal animation="fade-left" delay={200} duration={900} className="order-1 md:order-2">
              <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Meet The Founder</p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6 leading-tight font-lobster"
              >
                Rayan&apos;s Vision of
                <br />
                <span className="text-gradient-gold">Luxury for All</span>
              </h2>
              <div className="divider-gold !ml-0 mb-8" />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  In <strong className="text-dark">2014</strong>, Rayan started Rayn Look with nothing — no investors, no big team, no fancy office. Just a relentless belief that premium contact lenses shouldn&apos;t be a luxury reserved for the few.
                </p>
                <p>
                  Starting from scratch in Lebanon, Rayan spent years perfecting the craft — sourcing the finest FDA-approved materials, building relationships with world-class manufacturers, and listening to what customers truly wanted: <em>lenses that look natural, feel comfortable, and make you feel confident</em>.
                </p>
                <p>
                  What began as a small local operation grew into something extraordinary. Word spread from Beirut to Baghdad, from Erbil to Amman, and eventually across the entire globe. Today, Rayn Look is proudly present in <strong className="text-dark">Lebanon, Iraq, and 30+ countries worldwide</strong>.
                </p>
                <p>
                  &ldquo;We started with nothing. We built everything with passion. And we&apos;re just getting started.&rdquo;
                  <span className="block text-gold font-semibold mt-2">— Rayan, Founder</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-10">
                <Link href="/shop" className="btn-gold inline-block">
                  Explore Our Lenses
                </Link>
                <Link href="/contact" className="btn-outline-gold inline-block">
                  Get In Touch
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section className="py-24 lg:py-32 bg-gray-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Our Journey</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-dark mb-4 font-lobster"
            >
              From 2014 to the World
            </h2>
            <div className="divider-gold mt-6" />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold/50 to-gold/20" />

            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`relative flex items-start mb-12 last:mb-0 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-gold border-4 border-white shadow-md z-10" />

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="text-gold font-bold text-lg">{m.year}</span>
                  <h3 className="text-dark font-semibold text-xl mt-1 mb-2 font-lobster">{m.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">What We Stand For</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-dark mb-4 font-lobster"
            >
              Our Values
            </h2>
            <div className="divider-gold mt-6" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💎',
                title: 'Premium Quality',
                desc: 'Only the finest FDA-approved materials and manufacturing processes make it into our lenses. No compromises.',
              },
              {
                icon: '❤️',
                title: 'Customer First',
                desc: 'Your comfort, safety, and satisfaction drive every decision we make. From sourcing to shipping.',
              },
              {
                icon: '🚀',
                title: 'Relentless Innovation',
                desc: 'We continuously push boundaries to deliver better comfort, more natural colors, and superior clarity.',
              },
            ].map((v) => (
              <div key={v.title} className="bg-gray-light rounded-2xl p-10 text-center magnetic-hover hover:shadow-lg group">
                <span className="text-5xl block mb-6 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">{v.icon}</span>
                <h3 className="text-lg font-semibold text-dark mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where We Are */}
      <section className="py-24 lg:py-32 bg-dark text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Global Presence</p>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6 font-lobster"
              >
                From Beirut & Baghdad <span className="text-gradient-gold">to the World</span>
              </h2>
              <div className="divider-gold !ml-0 mb-8" />
              <p className="text-gray-400 leading-relaxed mb-6">
                Rayn Look is headquartered across Lebanon and Iraq, with a growing presence throughout the Middle East, Europe, and beyond. Our lenses reach customers in over 30 countries.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { flag: '🇱🇧', country: 'Lebanon', status: 'Headquarters' },
                  { flag: '🇮🇶', country: 'Iraq', status: 'Regional Hub' },
                  { flag: '🇦🇪', country: 'UAE', status: 'Active Market' },
                  { flag: '🇯🇴', country: 'Jordan', status: 'Active Market' },
                  { flag: '🇰🇼', country: 'Kuwait', status: 'Active Market' },
                  { flag: '🇪🇬', country: 'Egypt', status: 'Active Market' },
                ].map((loc) => (
                  <div key={loc.country} className="flex items-center gap-3 glass-card rounded-xl p-4">
                    <span className="text-2xl">{loc.flag}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{loc.country}</p>
                      <p className="text-gold/70 text-xs">{loc.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="inline-block relative">
                <span className="text-[200px] leading-none opacity-10">🌍</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-5xl font-bold text-gradient-gold font-lobster">30+</p>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mt-2">Countries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-light text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4">Join Our Journey</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-dark mb-4 font-lobster"
          >
            Be Part of Something Beautiful
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Experience the lenses that have transformed the way thousands see and are seen. Start your Rayn Look journey today.
          </p>
          <Link href="/shop" className="btn-gold inline-block">
            Shop Now
          </Link>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            mainEntity: {
              '@type': 'Organization',
              name: 'Rayn Look',
              foundingDate: '2014',
              founder: { '@type': 'Person', name: 'Rayan' },
              description: 'Premium contact lenses brand founded in 2014, now serving 30+ countries worldwide from Lebanon and Iraq.',
              areaServed: ['Lebanon', 'Iraq', 'UAE', 'Jordan', 'Kuwait', 'Egypt'],
            },
          }),
        }}
      />
    </StorefrontLayout>
  );
}
