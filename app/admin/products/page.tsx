'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stockQuantity: number;
  featured: boolean;
  active: boolean;
  color: string;
  duration: string;
  category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Products
          </h1>
          <p className="text-gray-400 mt-1">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-gold flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-admin-card border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
        />
      </div>

      {/* Table */}
      <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Product</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">SKU</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Category</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Price</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Stock</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Featured</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.color} · {product.duration}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{product.sku}</td>
                  <td className="p-4 text-sm text-gray-300">{product.category.name}</td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm text-white font-medium">{formatPrice(product.price)}</p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${
                      product.stockQuantity === 0 ? 'text-error' :
                      product.stockQuantity <= 10 ? 'text-warning' : 'text-success'
                    }`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.featured ? 'bg-admin-accent/20 text-admin-accent' : 'bg-white/10 text-gray-400'
                    }`}>
                      {product.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/shop/product/${product.slug}`}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-gray-400 hover:text-admin-accent transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-error transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
