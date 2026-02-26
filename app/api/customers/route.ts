import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError, sanitizeSearchInput } from '@/lib/auth';

// GET /api/customers
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('User')
      .select('*, orders:Order(total, createdAt)', { count: 'exact' })
      .eq('role', 'CUSTOMER')
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (search) {
      const safeSearch = sanitizeSearchInput(search);
      if (safeSearch) {
        query = query.or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
      }
    }

    const { data: customers, count, error } = await query;
    if (error) throw error;

    const customersWithStats = (customers || []).map((c) => ({
      ...c,
      totalOrders: c.orders?.length || 0,
      totalSpent: c.orders?.reduce((sum: number, o: { total: number }) => sum + o.total, 0) || 0,
      lastOrderDate: c.orders?.length > 0 ? c.orders[0].createdAt : null,
    }));

    return NextResponse.json({
      customers: customersWithStats,
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST /api/customers — Create a new customer manually
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { name, email, phone, address, city, country, zipCode } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A customer with this email already exists' }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from('User')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        address: address || null,
        city: city || null,
        country: country || null,
        zipCode: zipCode || null,
        role: 'CUSTOMER',
        password: '',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ customer: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
