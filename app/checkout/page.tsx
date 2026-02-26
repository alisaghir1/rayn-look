import type { Metadata } from 'next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Rayn Look order securely.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <StorefrontLayout>
      <CheckoutForm />
    </StorefrontLayout>
  );
}
