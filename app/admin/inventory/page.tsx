'use client';

import { useEffect, useState } from 'react';
import { Search, AlertTriangle, Package, ArrowUpDown, Save } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  color: string;
  duration: string;
  category: { name: string };
  recentLogs: { id: string; change: number; reason: string; newStock: number; createdAt: string }[];
}



export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setInventory(data.products);
      })
      .catch(() => {});
  }, []);

  const filtered = inventory.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchLowStock = !showLowStock || item.stockQuantity <= 10;
    return matchSearch && matchLowStock;
  });

  const totalStock = inventory.reduce((sum, i) => sum + i.stockQuantity, 0);
  const outOfStock = inventory.filter((i) => i.stockQuantity === 0).length;
  const lowStock = inventory.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= 10).length;

  const handleQuickUpdate = async (productId: string) => {
    const newQty = parseInt(editQty);
    if (isNaN(newQty) || newQty < 0) return;

    try {
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          newQuantity: newQty,
          reason: editReason || 'Manual adjustment',
        }),
      });

      setInventory(
        inventory.map((item) =>
          item.id === productId ? { ...item, stockQuantity: newQty } : item
        )
      );
      setEditingId(null);
      setEditQty('');
      setEditReason('');
    } catch (e) {
      console.error('Stock update failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-lobster">
          Inventory Management
        </h1>
        <p className="text-gray-400 mt-1">Track and manage product stock levels</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-admin-card rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Package className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider">Total Stock</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalStock}</p>
        </div>
        <div className="bg-admin-card rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <ArrowUpDown className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider">Products</span>
          </div>
          <p className="text-2xl font-bold text-white">{inventory.length}</p>
        </div>
        <div className="bg-admin-card rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <AlertTriangle className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{lowStock}</p>
        </div>
        <div className="bg-admin-card rounded-xl p-5 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <AlertTriangle className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider">Out of Stock</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-admin-card border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-admin-accent"
          />
        </div>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-3 rounded-lg text-sm border transition-colors ${
            showLowStock
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              : 'bg-admin-card border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Low Stock Only
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Product</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">SKU</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Category</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Current Stock</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Status</th>
                <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Quick Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.color} · {item.duration}</p>
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-300">{item.sku}</td>
                  <td className="p-4 text-sm text-gray-300">{item.category.name}</td>
                  <td className="p-4">
                    <span className={`text-lg font-bold ${
                      item.stockQuantity === 0 ? 'text-red-400' :
                      item.stockQuantity <= 10 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {item.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.stockQuantity === 0 ? 'bg-red-500/20 text-red-400' :
                      item.stockQuantity <= 10 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.stockQuantity === 0 ? 'Out of Stock' : item.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="p-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 px-2 py-1 bg-admin-bg border border-white/10 rounded text-white text-sm focus:outline-none focus:border-admin-accent"
                          placeholder="Qty"
                        />
                        <input
                          type="text"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          className="w-32 px-2 py-1 bg-admin-bg border border-white/10 rounded text-white text-sm focus:outline-none focus:border-admin-accent"
                          placeholder="Reason"
                        />
                        <button
                          onClick={() => handleQuickUpdate(item.id)}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditQty(item.stockQuantity.toString());
                          setEditReason('');
                        }}
                        className="text-xs text-admin-accent hover:underline"
                      >
                        Update Stock
                      </button>
                    )}
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
