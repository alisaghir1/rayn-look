import type { Metadata } from 'next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import CartPageContent from './CartPageContent';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your Rayn Look shopping cart.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <StorefrontLayout>
      <CartPageContent />
    </StorefrontLayout>
  );
}
