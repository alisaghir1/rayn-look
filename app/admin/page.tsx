'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Analytics {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    todaysSales: number;
    todaysOrders: number;
    monthRevenue: number;
  };
  charts: {
    dailyRevenue: { date: string; amount: number }[];
    dailyOrders: { date: string; count: number }[];
  };
  lowStockProducts: { id: string; name: string; sku: string; stockQuantity: number }[];
  topProducts: { name: string; totalSold: number; totalRevenue: number }[];
  categoryPerformance: { name: string; revenue: number; productCount: number }[];
}

// Empty initial state — populated from API
const emptyAnalytics: Analytics = {
  kpis: {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    todaysSales: 0,
    todaysOrders: 0,
    monthRevenue: 0,
  },
  charts: {
    dailyRevenue: [],
    dailyOrders: [],
  },
  lowStockProducts: [],
  topProducts: [],
  categoryPerformance: [],
};

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics>(emptyAnalytics);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((d) => {
        if (d.kpis) setData(d);
      })
      .catch(() => {
        // Use mock data on error
      });
  }, []);

  const kpiCards = [
    { label: 'Total Revenue', value: formatPrice(data.kpis.totalRevenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'Total Orders', value: data.kpis.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Avg Order Value', value: formatPrice(data.kpis.avgOrderValue), icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Total Customers', value: data.kpis.totalCustomers.toLocaleString(), icon: Users, color: 'text-purple-400' },
    { label: "Today's Sales", value: formatPrice(data.kpis.todaysSales), icon: ArrowUpRight, color: 'text-emerald-400' },
    { label: 'Month Revenue', value: formatPrice(data.kpis.monthRevenue), icon: DollarSign, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-lobster">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Welcome back. Here&apos;s your store overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-admin-card rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Revenue (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.charts.dailyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6A75E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6A75E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#666" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#0F3460', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#C6A75E' }}
                formatter={(value: unknown) => [formatPrice(value as number), 'Revenue']}
              />
              <Area type="monotone" dataKey="amount" stroke="#C6A75E" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Orders (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.charts.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#666" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0F3460', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#C6A75E' }}
              />
              <Bar dataKey="count" fill="#C6A75E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Top Selling Products
          </h2>
          <div className="space-y-3">
            {data.topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-admin-accent font-bold w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.totalSold} sold</p>
                  </div>
                </div>
                <span className="text-sm text-admin-accent font-medium">
                  {formatPrice(product.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Sales by Category
          </h2>
          <div className="space-y-3">
            {data.categoryPerformance.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{cat.name}</span>
                  <span className="text-admin-accent">{formatPrice(cat.revenue)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-admin-accent rounded-full"
                    style={{
                      width: `${Math.min(100, (cat.revenue / (data.categoryPerformance[0]?.revenue || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Low Stock Alerts
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">All products are well stocked.</p>
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.sku}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${product.stockQuantity <= 3 ? 'text-error' : 'text-warning'}`}>
                    {product.stockQuantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
