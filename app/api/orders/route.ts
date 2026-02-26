import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/utils';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/orders
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('Order')
      .select('*, user:User(*), items:OrderItem(*, product:Product(*))', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('orderStatus', status);

    const { data: orders, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      orders: orders || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — Manual order creation from admin (in-store sales)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      paymentStatus = 'PAID',
      orderStatus = 'DELIVERED',
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!customerName) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    // Validate stock and compute totals
    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; price: number; total: number; degree?: string; productName: string }[] = [];

    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('Product')
        .select('id, name, price, stockQuantity')
        .eq('id', item.productId)
        .single();

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        degree: item.degree || null,
        productName: product.name,
      });
    }

    // Find or create customer
    let userId: string | null = null;
    if (customerEmail) {
      const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (existingUser) {
        userId = existingUser.id;
        await supabaseAdmin
          .from('User')
          .update({ name: customerName, phone: customerPhone || null })
          .eq('id', userId);
      } else {
        const { data: newUser } = await supabaseAdmin
          .from('User')
          .insert({
            email: customerEmail,
            name: customerName,
            password: '',
            phone: customerPhone || null,
          })
          .select('id')
          .single();
        if (newUser) userId = newUser.id;
      }
    }

    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('Order')
      .insert({
        orderNumber,
        userId,
        subtotal,
        total: subtotal,
        paymentMethod: 'in_store',
        paymentStatus,
        orderStatus,
        shippingName: customerName,
        shippingEmail: customerEmail || null,
        shippingPhone: customerPhone || null,
        notes: notes || `In-store order`,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Create order items
    const itemsToInsert = orderItems.map((oi) => ({
      orderId: order.id,
      productId: oi.productId,
      quantity: oi.quantity,
      price: oi.price,
      total: oi.total,
      degree: oi.degree,
    }));
    await supabaseAdmin.from('OrderItem').insert(itemsToInsert);

    // Decrease stock & log inventory
    for (const item of orderItems) {
      const { data: prod } = await supabaseAdmin
        .from('Product')
        .select('stockQuantity')
        .eq('id', item.productId)
        .single();

      const newStock = (prod?.stockQuantity || 0) - item.quantity;

      await supabaseAdmin
        .from('Product')
        .update({ stockQuantity: newStock })
        .eq('id', item.productId);

      await supabaseAdmin.from('InventoryLog').insert({
        productId: item.productId,
        change: -item.quantity,
        reason: `In-store order ${orderNumber}`,
        newStock,
      });
    }

    return NextResponse.json({ success: true, orderNumber, orderId: order.id });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
