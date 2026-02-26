'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Users,
  Boxes,
  BarChart3,
  Settings,
  ArrowLeft,
  Star,
  MessageSquare,
  LogOut,
  Image,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { name: 'Hero Slides', href: '/admin/hero-slides', icon: Image },
  { name: 'Celebrities', href: '/admin/celebrities', icon: Star },
  { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-admin-sidebar text-admin-text flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="block">
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-white">RAYN</span>
            <span className="text-admin-accent ml-1">LOOK</span>
          </span>
          <span className="block text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-admin-accent/20 text-admin-accent'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store & Logout */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
