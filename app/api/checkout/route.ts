import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/utils';

// POST /api/checkout — Create order (COD or Online)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping, paymentMethod = 'cod' } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (!shipping?.email || !shipping?.firstName || !shipping?.lastName || !shipping?.address || !shipping?.phone) {
      return NextResponse.json({ error: 'Missing shipping details (including phone)' }, { status: 400 });
    }

    // Validate stock availability
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('Product')
        .select('id, name, stockQuantity')
        .eq('id', item.id)
        .single();

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 404 });
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; price: number; total: number; degree?: string }[] = [];

    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('Product')
        .select('id, price, name, images')
        .eq('id', item.id)
        .single();
      if (!product) continue;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        degree: item.degree || null,
      });
    }

    // Find or create user — update info if they exist
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', shipping.email)
      .single();

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      // Update user details with latest shipping info
      await supabaseAdmin
        .from('User')
        .update({
          name: `${shipping.firstName} ${shipping.lastName}`,
          phone: shipping.phone || null,
          address: shipping.address,
          city: shipping.city,
          country: shipping.country,
          zipCode: shipping.zipCode,
        })
        .eq('id', userId);
    } else {
      const { data: newUser, error: userErr } = await supabaseAdmin
        .from('User')
        .insert({
          email: shipping.email,
          name: `${shipping.firstName} ${shipping.lastName}`,
          password: '',
          phone: shipping.phone || null,
          address: shipping.address,
          city: shipping.city,
          country: shipping.country,
          zipCode: shipping.zipCode,
        })
        .select('id')
        .single();
      if (userErr) throw userErr;
      userId = newUser.id;
    }

    const orderNumber = generateOrderNumber();

    // Determine payment status based on method
    const paymentStatus = paymentMethod === 'cod' ? 'COD' : 'PENDING';

    // Create order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('Order')
      .insert({
        orderNumber,
        userId,
        subtotal,
        total: subtotal,
        paymentMethod,
        paymentStatus,
        shippingName: `${shipping.firstName} ${shipping.lastName}`,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone || null,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingCountry: shipping.country,
        shippingZip: shipping.zipCode,
        notes: shipping.notes || null,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Create order items (includes degree)
    const itemsToInsert = orderItems.map((oi) => ({
      ...oi,
      orderId: order.id,
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
        reason: `Order ${orderNumber}`,
        newStock,
      });
    }

    // COD orders — return success directly
    if (paymentMethod === 'cod') {
      return NextResponse.json({ success: true, orderNumber });
    }

    // Online payment — Stripe (Coming Soon, fallback to success)
    try {
      const { stripe } = await import('@/lib/stripe');

      const lineItems = [];
      for (const item of items) {
        const { data: product } = await supabaseAdmin
          .from('Product')
          .select('name, price, images')
          .eq('id', item.id)
          .single();
        if (!product) continue;

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              images: product.images?.length > 0 ? [product.images[0]] : [],
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderNumber}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
        customer_email: shipping.email,
        metadata: { orderId: order.id, orderNumber },
      });

      await supabaseAdmin
        .from('Order')
        .update({ stripePaymentId: session.id })
        .eq('id', order.id);

      return NextResponse.json({ url: session.url });
    } catch {
      return NextResponse.json({ success: true, orderNumber });
    }
  } catch (error) {
    console.error('POST /api/checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
