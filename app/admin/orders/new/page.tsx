'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, Search, ShoppingBag, Loader2, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  sku: string;
}

interface OrderLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  image: string;
  degree?: string;
}

export default function AdminNewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [orderStatus, setOrderStatus] = useState('DELIVERED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/products?limit=500')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      if (existing.quantity < product.stockQuantity) {
        setLines(lines.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
        ));
      }
    } else {
      setLines([
        ...lines,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          maxStock: product.stockQuantity,
          image: product.images?.[0] || '',
        },
      ]);
    }
    setSearch('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setLines(lines.map((l) => {
      if (l.productId !== productId) return l;
      const newQty = l.quantity + delta;
      if (newQty <= 0 || newQty > l.maxStock) return l;
      return { ...l, quantity: newQty };
    }));
  };

  const removeLine = (productId: string) => {
    setLines(lines.filter((l) => l.productId !== productId));
  };

  const updateDegree = (productId: string, degree: string) => {
    setLines(lines.map((l) =>
      l.productId === productId ? { ...l, degree } : l
    ));
  };

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const handleSubmit = async () => {
    setError('');
    if (lines.length === 0) {
      setError('Add at least one product to the order');
      return;
    }
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            degree: l.degree || undefined,
          })),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          paymentStatus,
          orderStatus,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create order');
        return;
      }
      setSuccess(`Order ${data.orderNumber} created successfully!`);
      setTimeout(() => router.push('/admin/orders'), 1500);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <CheckCircle className="h-16 w-16 text-green-400" />
        <p className="text-xl font-semibold text-white">{success}</p>
        <p className="text-gray-400">Redirecting to orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-lobster">
          New Order
        </h1>
        <p className="text-gray-400 mt-1">Create an in-store or manual order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Search */}
          <div className="bg-admin-card rounded-xl p-6 border border-white/5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Add Products</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
              />
            </div>

            {search.length >= 2 && (
              <div className="mt-3 max-h-60 overflow-y-auto space-y-1 border border-white/10 rounded-lg">
                {filteredProducts.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">No products found</p>
                ) : (
                  filteredProducts.slice(0, 10).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                    >
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">SKU: {product.sku} · Stock: {product.stockQuantity}</p>
                      </div>
                      <span className="text-sm text-admin-accent font-medium">{formatPrice(product.price)}</span>
                      <Plus className="h-4 w-4 text-gray-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Order Lines */}
          <div className="bg-admin-card rounded-xl p-6 border border-white/5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Order Items ({lines.length})
            </h2>

            {lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <ShoppingBag className="h-10 w-10 mb-3" />
                <p className="text-sm">No products added yet</p>
                <p className="text-xs mt-1">Search and add products above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div key={line.productId} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    {line.image ? (
                      <img src={line.image} alt="" className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{line.name}</p>
                      <p className="text-xs text-gray-400">{formatPrice(line.price)} each</p>
                      <input
                        type="text"
                        placeholder="Degree (optional)"
                        value={line.degree || ''}
                        onChange={(e) => updateDegree(line.productId, e.target.value)}
                        className="mt-1 w-32 px-2 py-1 text-xs bg-admin-bg border border-white/10 rounded text-white placeholder-gray-600 focus:outline-none focus:border-admin-accent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(line.productId, -1)}
                        className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm text-white w-8 text-center">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.productId, 1)}
                        className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-admin-accent w-20 text-right">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                    <button
                      onClick={() => removeLine(line.productId)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-sm text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-admin-accent">{formatPrice(subtotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Customer & Summary */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-admin-card rounded-xl p-6 border border-white/5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full px-3 py-2.5 bg-admin-bg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full px-3 py-2.5 bg-admin-bg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full px-3 py-2.5 bg-admin-bg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
                />
              </div>
            </div>
          </div>

          {/* Order Settings */}
          <div className="bg-admin-card rounded-xl p-6 border border-white/5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Order Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                >
                  <option value="DELIVERED">Delivered</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional order notes..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-admin-bg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="bg-admin-card rounded-xl p-6 border border-white/5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Items</span>
                <span className="text-white">{lines.reduce((s, l) => s + l.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-white font-semibold">Total</span>
                <span className="text-admin-accent font-bold text-lg">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 mb-3 bg-red-500/10 rounded-lg p-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || lines.length === 0}
              className="w-full py-3 bg-admin-accent hover:bg-admin-accent/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Create Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
