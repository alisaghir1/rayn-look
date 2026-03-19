import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-slide-up">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h1
          className="text-3xl font-bold text-primary-black mb-3 font-lobster"
        >
          Thank You for Your Order!
        </h1>

        <p className="text-primary-gray mb-6">
          Your order has been confirmed and is being processed. You will receive an email
          confirmation shortly with your order details.
        </p>

        {sessionId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-primary-gray">
              <Package className="h-4 w-4" />
              <span>Session: {sessionId.substring(0, 20)}...</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
          <h2 className="text-sm font-semibold text-primary-black uppercase tracking-wider">
            What Happens Next?
          </h2>
          <div className="space-y-2 text-sm text-primary-gray">
            <p>1. You&apos;ll receive an order confirmation email</p>
            <p>2. We&apos;ll prepare your lenses with care</p>
            <p>3. Your order will be shipped within 1-2 business days</p>
            <p>4. Track your delivery via the shipping confirmation email</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="btn-gold flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="btn-outline-gold flex items-center justify-center gap-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
