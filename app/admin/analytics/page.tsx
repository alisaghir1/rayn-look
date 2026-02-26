'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUp, ArrowDown, Loader2, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const PIE_COLORS = ['#C6A75E', '#9CA3AF', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    todaysSales: number;
    todaysOrders: number;
    monthRevenue: number;
    periodRevenue: number;
    periodOrders: number;
    periodAvgOrderValue: number;
    revenueChange: number;
    ordersChange: number;
    avgOrderChange: number;
    customersChange: number;
  };
  charts: {
    dailyRevenue: { date: string; amount: number }[];
    dailyOrders: { date: string; count: number }[];
  };
  monthlyGrowth: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; totalSold: number; totalRevenue: number }[];
  categoryPerformance: { name: string; revenue: number; productCount: number }[];
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`);
      const json = await res.json();
      if (json.kpis) setData(json);
    } catch {
      // keep last data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const handlePeriodChange = (p: '7d' | '30d' | '90d') => {
    setPeriod(p);
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-admin-accent animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const kpiCards = [
    {
      label: 'Period Revenue',
      value: formatPrice(data.kpis.periodRevenue),
      icon: DollarSign,
      change: data.kpis.revenueChange,
    },
    {
      label: 'Period Orders',
      value: data.kpis.periodOrders.toLocaleString(),
      icon: ShoppingBag,
      change: data.kpis.ordersChange,
    },
    {
      label: 'Avg Order Value',
      value: formatPrice(data.kpis.periodAvgOrderValue),
      icon: TrendingUp,
      change: data.kpis.avgOrderChange,
    },
    {
      label: 'Total Customers',
      value: data.kpis.totalCustomers.toLocaleString(),
      icon: Users,
      change: data.kpis.customersChange,
    },
  ];

  const categoryPieData = data.categoryPerformance
    .filter((c) => c.revenue > 0)
    .map((c, i) => ({ name: c.name, value: c.revenue, color: PIE_COLORS[i % PIE_COLORS.length] }));

  const periodLabel = period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Analytics
          </h1>
          <p className="text-gray-400 mt-1">Business performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(period)}
            disabled={loading}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-admin-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-admin-card rounded-lg border border-white/10 overflow-hidden">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 text-sm transition-colors ${
                  period === p ? 'bg-admin-accent text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const positive = kpi.change >= 0;
          return (
            <div key={kpi.label} className="bg-admin-card rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className="h-4 w-4 text-admin-accent" />
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {positive ? (
                  <ArrowUp className="h-3 w-3 text-green-400" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs ${positive ? 'text-green-400' : 'text-red-400'}`}>
                  {formatChange(kpi.change)}
                </span>
                <span className="text-xs text-gray-500">vs previous period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-admin-card rounded-xl p-6 border border-white/5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Revenue Trend — {periodLabel}
        </h2>
        <div className="h-72">
          {data.charts.dailyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">No revenue data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#C6A75E' }}
                  formatter={(value: unknown) => [formatPrice(value as number), 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#C6A75E" fill="url(#goldGradient)" strokeWidth={2} />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A75E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C6A75E" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Daily Orders — {periodLabel}
          </h2>
          <div className="h-56">
            {data.charts.dailyOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">No order data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#C6A75E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Sales by Category</h2>
          <div className="h-56">
            {categoryPieData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">No sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: unknown) => [formatPrice(value as number), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {categoryPieData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Growth + Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Monthly Growth (12 Months)</h2>
          <div className="h-56">
            {data.monthlyGrowth.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">No monthly data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: unknown) => [formatPrice(value as number), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#C6A75E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Selling Products</h2>
          {data.topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-gray-500">No sales data yet</div>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-5">#{index + 1}</span>
                    <div>
                      <p className="text-sm text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.totalSold} sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-admin-accent">{formatPrice(product.totalRevenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
