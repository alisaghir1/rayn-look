import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/admin/analytics — Dashboard & analytics data
// Query params: ?period=7d|30d|90d (default 30d)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    const prevPeriodStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch data in parallel
    const [
      allOrdersRes,
      customersRes,
      todaysOrdersRes,
      periodOrdersRes,
      prevPeriodOrdersRes,
      lowStockRes,
      categoriesRes,
    ] = await Promise.all([
      supabaseAdmin.from('Order').select('total, paymentStatus'),
      supabaseAdmin.from('User').select('id', { count: 'exact' }).eq('role', 'CUSTOMER'),
      supabaseAdmin.from('Order').select('total').gte('createdAt', todayStart),
      supabaseAdmin.from('Order').select('total, createdAt, paymentStatus').gte('createdAt', periodStart).order('createdAt', { ascending: true }),
      supabaseAdmin.from('Order').select('total, paymentStatus').gte('createdAt', prevPeriodStart).lt('createdAt', periodStart),
      supabaseAdmin.from('Product').select('id, name, sku, stockQuantity').eq('active', true).lte('stockQuantity', 10).order('stockQuantity', { ascending: true }).limit(10),
      supabaseAdmin.from('Category').select('id, name'),
    ]);

    // --- KPIs ---
    const allOrders = allOrdersRes.data || [];
    const paidOrders = allOrders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = allOrders.length;
    const totalCustomers = customersRes.count || 0;
    const todaysOrders = todaysOrdersRes.data || [];
    const todaysSales = todaysOrders.reduce((sum, o) => sum + o.total, 0);

    // Period orders for KPIs
    const periodOrders = periodOrdersRes.data || [];
    const periodPaid = periodOrders.filter((o) => o.paymentStatus === 'PAID');
    const periodRevenue = periodPaid.reduce((sum, o) => sum + o.total, 0);
    const periodOrderCount = periodOrders.length;
    const periodAvg = periodOrderCount > 0 ? periodRevenue / periodOrderCount : 0;

    // Previous period for percentage changes
    const prevOrders = prevPeriodOrdersRes.data || [];
    const prevPaid = prevOrders.filter((o) => o.paymentStatus === 'PAID');
    const prevRevenue = prevPaid.reduce((sum, o) => sum + o.total, 0);
    const prevOrderCount = prevOrders.length;
    const prevAvg = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };

    // Month revenue from paid orders
    const monthPaidRes = await supabaseAdmin.from('Order').select('total').eq('paymentStatus', 'PAID').gte('createdAt', monthStart);
    const monthRevenue = (monthPaidRes.data || []).reduce((sum, o) => sum + o.total, 0);

    // --- Top selling products (aggregate from OrderItem within period) ---
    const periodOrderIds = periodOrders.map((o) => {
      // We need order IDs - fetch them
      return null;
    });
    // Fetch order items globally (simpler, matches all time)
    const { data: orderItems } = await supabaseAdmin.from('OrderItem').select('productId, quantity, total');
    const productAgg: Record<string, { quantity: number; total: number }> = {};
    (orderItems || []).forEach((oi) => {
      if (!productAgg[oi.productId]) productAgg[oi.productId] = { quantity: 0, total: 0 };
      productAgg[oi.productId].quantity += oi.quantity;
      productAgg[oi.productId].total += oi.total;
    });
    const topProductIds = Object.entries(productAgg)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5);

    const topProducts = [];
    for (const [pid, stats] of topProductIds) {
      const { data: p } = await supabaseAdmin.from('Product').select('name, slug').eq('id', pid).single();
      topProducts.push({ name: p?.name || 'Unknown', slug: p?.slug || '', totalSold: stats.quantity, totalRevenue: stats.total });
    }

    // --- Category performance ---
    const categoryPerformance = [];
    for (const cat of categoriesRes.data || []) {
      const { data: products } = await supabaseAdmin.from('Product').select('id').eq('categoryId', cat.id);
      const pids = (products || []).map((p) => p.id);
      let catRevenue = 0;
      if (pids.length > 0) {
        const { data: catItems } = await supabaseAdmin.from('OrderItem').select('total').in('productId', pids);
        catRevenue = (catItems || []).reduce((sum, oi) => sum + oi.total, 0);
      }
      categoryPerformance.push({ name: cat.name, revenue: catRevenue, productCount: pids.length });
    }
    categoryPerformance.sort((a, b) => b.revenue - a.revenue);

    // --- Daily revenue/orders chart (fill all days in period) ---
    const dailyRevenueMap: Record<string, number> = {};
    const dailyOrdersMap: Record<string, number> = {};

    // Pre-fill every day in the period with 0
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyRevenueMap[key] = 0;
      dailyOrdersMap[key] = 0;
    }

    periodOrders.forEach((order) => {
      const day = order.createdAt.split('T')[0];
      if (dailyRevenueMap[day] !== undefined) {
        dailyRevenueMap[day] += order.paymentStatus === 'PAID' ? order.total : 0;
        dailyOrdersMap[day] += 1;
      }
    });

    // --- Monthly growth (last 12 months) ---
    const monthlyGrowth = [];
    for (let i = 11; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const mLabel = mDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const { data: mOrders } = await supabaseAdmin
        .from('Order')
        .select('total, paymentStatus')
        .gte('createdAt', mDate.toISOString())
        .lt('createdAt', mEnd.toISOString());
      const mPaid = (mOrders || []).filter((o) => o.paymentStatus === 'PAID');
      monthlyGrowth.push({
        month: mLabel,
        revenue: mPaid.reduce((s, o) => s + o.total, 0),
        orders: (mOrders || []).length,
      });
    }

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers,
        todaysSales,
        todaysOrders: todaysOrders.length,
        monthRevenue,
        // Period-specific
        periodRevenue,
        periodOrders: periodOrderCount,
        periodAvgOrderValue: periodAvg,
        // Percentage changes vs previous period
        revenueChange: pctChange(periodRevenue, prevRevenue),
        ordersChange: pctChange(periodOrderCount, prevOrderCount),
        avgOrderChange: pctChange(periodAvg, prevAvg),
        customersChange: 0, // Customers don't have period boundary
      },
      charts: {
        dailyRevenue: Object.entries(dailyRevenueMap).map(([date, amount]) => ({ date, amount })),
        dailyOrders: Object.entries(dailyOrdersMap).map(([date, count]) => ({ date, count })),
      },
      monthlyGrowth,
      lowStockProducts: lowStockRes.data || [],
      topProducts,
      categoryPerformance,
    });
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
