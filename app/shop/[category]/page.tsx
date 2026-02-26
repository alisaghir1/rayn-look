import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/ui/ProductCard';
import { categories } from '@/lib/constants';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};

  return {
    title: `${category.name} — Premium Contact Lenses`,
    description: `Shop ${category.name.toLowerCase()} from Rayn Look. ${category.description}`,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title: `${category.name} — Rayn Look`,
      description: category.description,
    },
  };
}

// Mock products per category
const getMockProductsByCategory = (slug: string) => {
  const allProducts = [
    { id: '1', name: 'Amber Glow', slug: 'amber-glow', price: 29.99, compareAtPrice: 39.99, images: [], color: 'Brown', duration: 'Monthly', category: { name: 'Brown Lenses', slug: 'brown-lenses' } },
    { id: '2', name: 'Silver Mist', slug: 'silver-mist', price: 34.99, compareAtPrice: null, images: [], color: 'Gray', duration: 'Monthly', category: { name: 'Gray Lenses', slug: 'gray-lenses' } },
    { id: '3', name: 'Forest Dream', slug: 'forest-dream', price: 32.99, compareAtPrice: 42.99, images: [], color: 'Green', duration: 'Monthly', category: { name: 'Green Lenses', slug: 'green-lenses' } },
    { id: '4', name: 'Ocean Deep', slug: 'ocean-deep', price: 31.99, compareAtPrice: null, images: [], color: 'Blue', duration: 'Yearly', category: { name: 'Blue Lenses', slug: 'blue-lenses' } },
    { id: '5', name: 'Hazel Charm', slug: 'hazel-charm', price: 35.99, compareAtPrice: 45.99, images: [], color: 'Hazel', duration: 'Monthly', category: { name: 'Hazel Lenses', slug: 'hazel-lenses' } },
    { id: '6', name: 'Caramel Touch', slug: 'caramel-touch', price: 28.99, compareAtPrice: null, images: [], color: 'Brown', duration: 'Yearly', category: { name: 'Brown Lenses', slug: 'brown-lenses' } },
  ];

  if (slug === 'monthly-lenses') return allProducts.filter((p) => p.duration === 'Monthly');
  if (slug === 'yearly-lenses') return allProducts.filter((p) => p.duration === 'Yearly');
  return allProducts.filter((p) => p.category.slug === slug);
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = getMockProductsByCategory(slug);

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
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">No products found in this category.</p>
              <Link href="/shop" className="btn-gold">Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: category.name,
            numberOfItems: products.length,
            itemListElement: products.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://www.raynlook.com/shop/product/${p.slug}`,
              name: p.name,
            })),
          }),
        }}
      />
    </StorefrontLayout>
  );
}
