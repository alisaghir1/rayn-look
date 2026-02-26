'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    color: string;
    duration: string;
    category?: { name: string; slug: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;

  return (
    <Link
      href={`/shop/product/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-light mb-4">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-medium">
            <span className="text-4xl">👁</span>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-gold text-white text-xs font-medium px-2 py-1 rounded">
            -{discount}%
          </span>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <div className="space-y-1">
        {product.category && (
          <p className="text-xs text-gray-medium uppercase tracking-wider">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-medium text-dark group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-dark">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-medium line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-medium capitalize">
          {product.color} · {product.duration}
        </p>
      </div>
    </Link>
  );
}
