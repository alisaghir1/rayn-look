import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { data: order, error } = await supabaseAdmin
      .from('Order')
      .select('*, user:User(*), items:OrderItem(*, product:Product(*))')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[id] — Update order status
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    // Fetch the current order status BEFORE updating (to prevent double stock restoration)
    const { data: currentOrder } = await supabaseAdmin
      .from('Order')
      .select('orderStatus')
      .eq('id', id)
      .single();

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = currentOrder.orderStatus;

    const updateData: Record<string, unknown> = {};
    if (body.orderStatus) updateData.orderStatus = body.orderStatus;
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: order, error } = await supabaseAdmin
      .from('Order')
      .update(updateData)
      .eq('id', id)
      .select('*, user:User(*), items:OrderItem(*, product:Product(*))')
      .single();

    if (error) throw error;

    // Restore stock ONLY if transitioning TO cancelled/refunded FROM a non-cancelled/refunded state
    const wasAlreadyCancelledOrRefunded = previousStatus === 'CANCELLED' || previousStatus === 'REFUNDED';
    const isNowCancelledOrRefunded = body.orderStatus === 'CANCELLED' || body.orderStatus === 'REFUNDED';

    if (isNowCancelledOrRefunded && !wasAlreadyCancelledOrRefunded) {
      for (const item of order.items) {
        const { data: product } = await supabaseAdmin
          .from('Product')
          .select('stockQuantity')
          .eq('id', item.productId)
          .single();

        const newStock = (product?.stockQuantity || 0) + item.quantity;

        await supabaseAdmin
          .from('Product')
          .update({ stockQuantity: newStock })
          .eq('id', item.productId);

        await supabaseAdmin.from('InventoryLog').insert({
          productId: item.productId,
          change: item.quantity,
          reason: `Order ${order.orderNumber} ${body.orderStatus.toLowerCase()}`,
          newStock,
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
