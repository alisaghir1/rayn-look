'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, Plus } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  degree?: string;
  product?: { name: string; images?: string[] };
}

interface Order {
  id: string;
  orderNumber: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: OrderItem[];
}



const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-gray-500/20 text-gray-400',
  PAID: 'bg-green-500/20 text-green-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, []);

  const filtered = orders.filter((o) => {
    const name = o.shippingName || o.user?.name || '';
    const email = o.shippingEmail || o.user?.email || '';
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o)));
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Orders
          </h1>
          <p className="text-gray-400 mt-1">{orders.length} total orders</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-admin-accent hover:bg-admin-accent/90 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-admin-card border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-admin-card border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Order</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Customer</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Date</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Total</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Payment</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Status</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <>
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-mono text-admin-accent">{order.orderNumber}</td>
                    <td className="p-4">
                      <p className="text-sm text-white">{order.shippingName || order.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{order.shippingEmail || order.user?.email || ''}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-sm text-white font-medium">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[order.paymentStatus] || 'bg-white/10 text-gray-400'}`}>
                        {order.paymentStatus}
                        {order.paymentMethod === 'in_store' && ' (Store)'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${statusColors[order.orderStatus] || 'bg-white/10 text-gray-400'}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr key={`${order.id}-detail`} className="border-b border-white/5">
                      <td colSpan={7} className="p-4 bg-white/5">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-white mb-2">Order Items</h4>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {item.product?.name || 'Unknown'} × {item.quantity}
                                {item.degree ? ` (${item.degree})` : ''}
                              </span>
                              <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                            <span className="text-sm font-semibold text-white">Total</span>
                            <span className="text-sm font-semibold text-admin-accent">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
