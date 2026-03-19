import type { Metadata } from 'next';
import Link from 'next/link';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/ui/ProductCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { StaggerGrid } from '@/components/ui/HomeAnimations';
import { supabaseAdmin } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Shop All Lenses',
  description:
    'Browse our complete collection of premium colored contact lenses. Monthly and yearly options in brown, gray, green, blue, and hazel.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage() {
  const [{ data: products }, { data: dbCategories }] = await Promise.all([
    supabaseAdmin
      .from('Product')
      .select('id, name, slug, price, compareAtPrice, images, color, duration, categoryId, Category:categoryId(name, slug)')
      .eq('active', true)
      .order('createdAt', { ascending: false }),
    supabaseAdmin
      .from('Category')
      .select('name, slug')
      .eq('active', true)
      .order('sortOrder', { ascending: true }),
  ]);

  const categories = dbCategories || [];

  const allProducts = (products || []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    price: p.price as number,
    compareAtPrice: p.compareAtPrice as number | null,
    images: (p.images as string[]) || [],
    color: (p.color as string) || '',
    duration: (p.duration as string) || '',
    category: (p.Category as { name: string; slug: string }) || { name: '', slug: '' },
  }));

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="bg-dark text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-gold/10 animate-spin-slow hidden lg:block" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-3 animate-fade-in">Our Collection</p>
          <h1
            className="text-3xl md:text-5xl font-bold mb-4 font-lobster animate-slide-up"
          >
            Shop All <span className="text-gradient-gold">Lenses</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            Premium contact lenses for every style and occasion.
          </p>
        </div>
      </section>

      {/* Category pills */}
      <section className="py-6 border-b border-gray-100 sticky top-16 lg:top-20 bg-white z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              href="/shop"
              className="flex-shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-wider bg-dark text-white rounded-full"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="flex-shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-wider border border-gray-200 text-gray-600 rounded-full hover:border-gold hover:text-gold transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {allProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">No products available yet.</p>
              <p className="text-gray-400 text-sm">Check back soon for our premium collection!</p>
            </div>
          ) : (
            <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8" delay={80}>
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      {/* ItemList Schema */}
      {allProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'All Contact Lenses',
              numberOfItems: allProducts.length,
              itemListElement: allProducts.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://www.raynlook.com/shop/product/${p.slug}`,
                name: p.name,
              })),
            }),
          }}
        />
      )}
    </StorefrontLayout>
  );
}
