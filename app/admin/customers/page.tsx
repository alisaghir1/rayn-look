'use client';

import { useEffect, useState } from 'react';
import { Search, Mail, ShoppingBag, Plus, X, Save, UserPlus } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

const emptyForm = { name: '', email: '', phone: '', address: '', city: '', country: 'Lebanon', zipCode: '' };

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = () => {
    fetch('/api/customers?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError('Name and email are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create customer');
        setSaving(false);
        return;
      }
      fetchCustomers();
      setShowForm(false);
      setForm(emptyForm);
    } catch {
      setError('Failed to create customer');
    }
    setSaving(false);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / Math.max(customers.reduce((sum, c) => sum + c.totalOrders, 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-lobster">
          Customers
        </h1>
        <p className="text-gray-400 mt-1">{totalCustomers} registered customers</p>
      </div>

      {/* Add Customer Button */}
      {!showForm && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <UserPlus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      )}

      {/* Add Customer Form */}
      {showForm && (
        <div className="bg-admin-card rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Add New Customer</h2>
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="Customer name" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="customer@email.com" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="+961 ..." />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="Lebanon" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="Beirut" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="Street address" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Customer'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setError(''); }} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-2.5 rounded-lg text-sm transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-admin-card rounded-xl p-5 border border-white/5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCustomers}</p>
        </div>
        <div className="bg-admin-card rounded-xl p-5 border border-white/5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-white mt-1">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-admin-card rounded-xl p-5 border border-white/5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Avg Order Value</p>
          <p className="text-2xl font-bold text-white mt-1">{formatPrice(avgOrderValue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-admin-card border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Customer</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Phone</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Location</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Orders</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Total Spent</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Last Order</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-admin-accent/20 flex items-center justify-center text-admin-accent text-sm font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{customer.phone || '—'}</td>
                  <td className="p-4 text-sm text-gray-300">{customer.city && customer.country ? `${customer.city}, ${customer.country}` : customer.country || '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-white">{customer.totalOrders}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{formatPrice(customer.totalSpent)}</td>
                  <td className="p-4 text-sm text-gray-300">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}
                  </td>
                  <td className="p-4">
                    <a
                      href={`mailto:${customer.email}`}
                      className="p-2 text-gray-400 hover:text-admin-accent transition-colors inline-flex"
                      title="Email Customer"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
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
