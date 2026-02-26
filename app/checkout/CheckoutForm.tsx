'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { Lock, Truck, Banknote, CreditCard, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutForm() {
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod] = useState<'cod' | 'online'>('cod');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: 'Lebanon',
    zipCode: '',
    phone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!formData.phone.trim()) {
      setError('Phone number is required for delivery.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            degree: item.degree || null,
          })),
          shipping: formData,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Checkout failed. Please try again.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        clearCart();
        window.location.href = `/checkout/success?order=${data.orderNumber}`;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  if (items.length === 0) {
    return (
      <section className="py-20 lg:py-32 text-center">
        <div className="mx-auto max-w-xl px-4">
          <h1
            className="text-3xl font-bold text-dark mb-4 font-lobster"
          >
            Your Cart is Empty
          </h1>
          <p className="text-gray-500 mb-8">Add some products before checking out.</p>
          <Link href="/shop" className="btn-gold">Shop Now</Link>
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
          Checkout
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Shipping Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone number *"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors mt-4"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  />
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors mt-4"
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP code (optional)"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="country"
                  required
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors mt-4"
                />
              </div>

              {/* Order Notes */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Order Notes (optional)</h2>
                <textarea
                  name="notes"
                  placeholder="Any special instructions for your order..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors resize-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label
                    className="flex items-center gap-3 p-4 border border-gold bg-gold/5 rounded-lg cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      value="cod"
                      checked
                      readOnly
                      className="accent-gold"
                    />
                    <Banknote className="h-5 w-5 text-gold" />
                    <div>
                      <p className="font-medium text-dark">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      value="online"
                      disabled
                      className="accent-gold"
                    />
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-400">Pay Online</p>
                      <p className="text-xs text-gray-400">Coming Soon</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-light rounded-lg p-6 space-y-4 lg:sticky lg:top-24">
                <h2 className="text-lg font-semibold font-lobster">
                  Order Summary
                </h2>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                        {item.degree && <span className="text-xs text-gray-400 ml-1">({item.degree})</span>}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gold text-xs">
                    <Globe className="h-3 w-3" />
                    <span>Worldwide Shipping &bull; Delivery all across Lebanon</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(getTotal())}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Truck className="h-4 w-4" />
                  {loading ? 'Processing...' : 'Place Order — Cash on Delivery'}
                </button>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Lock className="h-3 w-3" />
                  <span>Your information is secure</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
