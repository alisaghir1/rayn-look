import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/ui/ProductCard';
import { StaggerGrid } from '@/components/ui/HomeAnimations';
import { supabaseAdmin } from '@/lib/supabase/server';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const { data: category } = await supabaseAdmin
    .from('Category')
    .select('name, description')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!category) return {};

  return {
    title: `${category.name} — Premium Contact Lenses`,
    description: `Shop ${category.name.toLowerCase()} from Rayn Look. ${category.description}`,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title: `${category.name} — Rayn Look`,
      description: category.description || '',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: `${category.name} — Rayn Look` }],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  const [{ data: category }, { data: allCategories }, { data: products }] = await Promise.all([
    supabaseAdmin
      .from('Category')
      .select('id, name, slug, description')
      .eq('slug', slug)
      .eq('active', true)
      .single(),
    supabaseAdmin
      .from('Category')
      .select('name, slug')
      .eq('active', true)
      .order('sortOrder', { ascending: true }),
    supabaseAdmin
      .from('Product')
      .select('id, name, slug, price, compareAtPrice, images, color, duration, categoryId, Category:categoryId(name, slug)')
      .eq('active', true)
      .order('createdAt', { ascending: false }),
  ]);

  if (!category) notFound();

  const categories = allCategories || [];
  const categoryProducts = (products || [])
    .filter((p: Record<string, unknown>) => p.categoryId === category.id)
    .map((p: Record<string, unknown>) => ({
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
      <section className="bg-dark text-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-3">Collection</p>
          <h1
            className="text-3xl md:text-5xl font-bold mb-4 font-lobster"
          >
            {category.name}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">{category.description}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-4 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-dark font-medium">{category.name}</span>
          </nav>
        </div>
      </section>

      {/* Category pills */}
      <section className="py-6 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Link
              href="/shop"
              className="flex-shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-wider border border-gray-200 text-gray-600 rounded-full hover:border-gold hover:text-gold transition-colors"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className={`flex-shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-full transition-colors ${
                  cat.slug === slug
                    ? 'bg-dark text-white'
                    : 'border border-gray-200 text-gray-600 hover:border-gold hover:text-gold'
                }`}
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
          {categoryProducts.length > 0 ? (
            <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8" delay={80}>
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggerGrid>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">No products found in this category.</p>
              <Link href="/shop" className="btn-gold">Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* ItemList Schema */}
      {categoryProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: category.name,
              numberOfItems: categoryProducts.length,
              itemListElement: categoryProducts.map((p, i) => ({
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
