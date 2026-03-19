'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    color: string;
    duration: string;
    sku: string;
    stockQuantity: number;
    productType?: string;
    hasDegree?: boolean;
    availableDegrees?: string[];
    category: { name: string; slug: string };
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedDegree, setSelectedDegree] = useState('');
  const { addItem, openCart } = useCartStore();

  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;

  const handleAddToCart = () => {
    if (product.stockQuantity === 0) return;
    if (product.hasDegree && !selectedDegree) {
      alert('Please select a degree');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      image: product.images[0] || '',
      color: product.color,
      duration: product.duration,
      quantity,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      degree: selectedDegree || undefined,
      productType: product.productType,
    });
    openCart();
  };

  return (
    <section className="py-8 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-light shimmer-overlay">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">👁</span>
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-gold text-white text-sm font-medium px-3 py-1 rounded animate-bounce-in">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="100px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div>
              <p className="text-gold text-sm uppercase tracking-wider mb-2">{product.category.name}</p>
              <h1
                className="text-3xl md:text-4xl font-bold text-dark mb-4 font-lobster"
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-dark">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Color */}
            <div>
              <h3 className="text-sm font-medium text-dark mb-2">Color</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg">
                <span className="text-sm">{product.color}</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-sm font-medium text-dark mb-2">Duration</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg">
                <span className="text-sm">{product.duration}</span>
              </div>
            </div>

            {/* Degree Selector */}
            {product.hasDegree && product.availableDegrees && product.availableDegrees.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-dark mb-2">Degree *</h3>
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm"
                >
                  <option value="">Select degree...</option>
                  {product.availableDegrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-dark mb-2">Quantity</h3>
              <div className="inline-flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-gold transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="p-3 hover:text-gold transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stock status */}
            {product.stockQuantity === 0 ? (
              <p className="text-error font-medium">Out of Stock</p>
            ) : product.stockQuantity <= 10 ? (
              <p className="text-warning text-sm">Only {product.stockQuantity} left in stock!</p>
            ) : null}

            {/* Add to cart */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" />
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className="p-3 border border-gray-200 rounded hover:border-gold hover:text-gold transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Meta */}
            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <p>SKU: {product.sku}</p>
              <p>Category: {product.category.name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
