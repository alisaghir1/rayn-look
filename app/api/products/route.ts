import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/products — List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('Product')
      .select('*, category:Category(*)', { count: 'exact' })
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (featured === 'true') query = query.eq('featured', true);
    if (category) {
      const { data: cat } = await supabaseAdmin
        .from('Category')
        .select('id')
        .eq('slug', category)
        .single();
      if (cat) query = query.eq('categoryId', cat.id);
    }

    const { data: products, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      products: products || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — Create a product (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { name, slug, description, categoryId, color, duration, price, compareAtPrice, sku, stockQuantity, images, featured } = body;

    if (!name || !slug || !description || !categoryId || !color || !price || !sku) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const qty = parseInt(stockQuantity) || 0;

    const { data: product, error } = await supabaseAdmin
      .from('Product')
      .insert({
        name,
        slug,
        description,
        categoryId,
        color,
        duration: duration || 'MONTHLY',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku,
        stockQuantity: qty,
        images: images || [],
        featured: featured || false,
      })
      .select('*, category:Category(*)')
      .single();

    if (error) throw error;

    if (qty > 0) {
      await supabaseAdmin.from('InventoryLog').insert({
        productId: product.id,
        change: qty,
        reason: 'Initial stock',
        newStock: qty,
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
