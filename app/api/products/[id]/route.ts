import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { data: product, error } = await supabaseAdmin
      .from('Product')
      .select('*, category:Category(*)')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const { data: existing } = await supabaseAdmin
      .from('Product')
      .select('stockQuantity')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.compareAtPrice !== undefined) updateData.compareAtPrice = body.compareAtPrice ? parseFloat(body.compareAtPrice) : null;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = parseInt(body.stockQuantity);
    if (body.images !== undefined) updateData.images = body.images;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.active !== undefined) updateData.active = body.active;

    const { data: product, error } = await supabaseAdmin
      .from('Product')
      .update(updateData)
      .eq('id', id)
      .select('*, category:Category(*)')
      .single();

    if (error) throw error;

    if (body.stockQuantity !== undefined) {
      const stockChange = parseInt(body.stockQuantity) - existing.stockQuantity;
      if (stockChange !== 0) {
        await supabaseAdmin.from('InventoryLog').insert({
          productId: id,
          change: stockChange,
          reason: body.inventoryReason || 'Manual adjustment',
          newStock: parseInt(body.stockQuantity),
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] — Soft delete
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('Product')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
