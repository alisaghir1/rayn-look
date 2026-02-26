import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/inventory
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock');

    let query = supabaseAdmin
      .from('Product')
      .select('id, name, sku, stockQuantity, price, color, duration, category:Category(name)')
      .eq('active', true)
      .order('stockQuantity', { ascending: true });

    if (lowStock === 'true') {
      query = query.lte('stockQuantity', 10);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    // Fetch recent inventory logs for each product
    const productsWithLogs = await Promise.all(
      (products || []).map(async (p) => {
        const { data: logs } = await supabaseAdmin
          .from('InventoryLog')
          .select('change, reason, newStock, createdAt')
          .eq('productId', p.id)
          .order('createdAt', { ascending: false })
          .limit(5);
        return { ...p, recentLogs: logs || [] };
      })
    );

    return NextResponse.json({ products: productsWithLogs });
  } catch (error) {
    console.error('GET /api/inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// PUT /api/inventory — Quick stock update
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { productId, newQuantity, quantity, reason } = body;
    const targetQty = newQuantity ?? quantity;

    if (!productId || targetQty === undefined) {
      return NextResponse.json({ error: 'Missing productId or quantity' }, { status: 400 });
    }

    const { data: product } = await supabaseAdmin
      .from('Product')
      .select('stockQuantity')
      .eq('id', productId)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newStock = parseInt(targetQty);
    const change = newStock - product.stockQuantity;

    const { data: updated, error } = await supabaseAdmin
      .from('Product')
      .update({ stockQuantity: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('InventoryLog').insert({
      productId,
      change,
      reason: reason || 'Manual stock update',
      newStock,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/inventory error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
