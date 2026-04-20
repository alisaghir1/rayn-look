import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductDetail from './ProductDetail';
import TrustBadges from '@/components/ui/TrustBadges';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const { data: product, error } = await supabaseAdmin
    .from('Product')
    .select('*, category:Category(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error || !product) return null;
  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const categoryName = product.category?.name || 'Products';
  return {
    title: `${product.name} — ${categoryName}`,
    description: product.description?.slice(0, 160),
    alternates: { canonical: `/shop/product/${slug}` },
    openGraph: {
      title: `${product.name} — Rayn Look`,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : [{ url: '/og-image.jpg' }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.category || { name: 'Products', slug: 'all' };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Rayn Look',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.raynlook.com/shop/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.stockQuantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Rayn Look',
      },
    },
  };

  return (
    <StorefrontLayout>
      {/* Breadcrumb */}
      <section className="py-4 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
            <span>/</span>
            <Link href={`/shop/${category.slug}`} className="hover:text-gold transition-colors">{category.name}</Link>
            <span>/</span>
            <span className="text-dark font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <ProductDetail product={{ ...product, category }} />

      {/* Trust Badges */}
      <section className="py-12 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* Reviews Placeholder */}
      <section className="py-16 bg-gray-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-dark mb-8 text-center font-lobster"
          >
            Customer Reviews
          </h2>
          <div className="text-center text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </StorefrontLayout>
  );
}
