'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPageContent() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h1
            className="text-3xl font-bold text-dark mb-4 font-lobster"
          >
            Your Cart is Empty
          </h1>
          <p className="text-gray-500 mb-8">Discover our premium lenses and find your perfect pair.</p>
          <Link href="/shop" className="btn-gold">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1
          className="text-3xl font-bold text-dark mb-8 font-lobster"
        >
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-light flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">👁</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/product/${item.slug}`} className="font-medium text-dark hover:text-gold transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">{item.color} · {item.duration}</p>
                  <p className="text-sm font-semibold mt-2">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 border border-gray-200 rounded hover:border-gold transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 border border-gray-200 rounded hover:border-gold transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-gray-400 hover:text-error transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-gray-light rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold font-lobster">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex items-center gap-1 text-gold text-xs">
                  <span>🌍 Worldwide Shipping &bull; Delivery all across Lebanon</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatPrice(getTotal())}</span>
              </div>
              <Link href="/checkout" className="btn-gold block text-center w-full">
                Proceed to Checkout
              </Link>
              <Link href="/shop" className="block text-center text-sm text-gray-500 hover:text-gold transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
