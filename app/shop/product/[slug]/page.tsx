import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductDetail from './ProductDetail';
import TrustBadges from '@/components/ui/TrustBadges';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Mock product data — will be replaced with DB query
const getMockProduct = (slug: string) => {
  const products: Record<string, {
    id: string; name: string; slug: string; description: string; price: number;
    compareAtPrice: number | null; images: string[]; color: string; duration: string;
    sku: string; stockQuantity: number; category: { name: string; slug: string };
  }> = {
    'amber-glow': {
      id: '1', name: 'Amber Glow', slug: 'amber-glow',
      description: 'Experience the warmth of golden-brown hues with our Amber Glow lenses. These premium monthly lenses combine cutting-edge comfort technology with a stunning, natural-looking brown color that enhances your eyes with a warm, luminous glow. FDA-approved and UV-protected.',
      price: 29.99, compareAtPrice: 39.99, images: [],
      color: 'Brown', duration: 'Monthly', sku: 'RL-AG-001', stockQuantity: 50,
      category: { name: 'Brown Lenses', slug: 'brown-lenses' },
    },
    'silver-mist': {
      id: '2', name: 'Silver Mist', slug: 'silver-mist',
      description: 'Transform your look with our Silver Mist lenses. These sophisticated gray lenses offer a cool, mysterious appearance while maintaining a natural look. Perfect for creating a striking, elegant statement.',
      price: 34.99, compareAtPrice: null, images: [],
      color: 'Gray', duration: 'Monthly', sku: 'RL-SM-001', stockQuantity: 35,
      category: { name: 'Gray Lenses', slug: 'gray-lenses' },
    },
  };
  return products[slug] || null;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getMockProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} — ${product.category.name}`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/shop/product/${slug}` },
    openGraph: {
      title: `${product.name} — Rayn Look`,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [{ url: '/og-image.jpg' }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getMockProduct(slug);
  if (!product) notFound();

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
            <Link href={`/shop/${product.category.slug}`} className="hover:text-gold transition-colors">{product.category.name}</Link>
            <span>/</span>
            <span className="text-dark font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <ProductDetail product={product} />

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
