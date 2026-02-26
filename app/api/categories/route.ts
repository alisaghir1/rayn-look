import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/categories
export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('Category')
      .select('*, products:Product(id)')
      .order('name', { ascending: true });

    if (error) throw error;

    const result = (categories || []).map((cat) => ({
      ...cat,
      _count: { products: cat.products?.length || 0 },
      products: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { name, slug, description, image } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const { data: category, error } = await supabaseAdmin
      .from('Category')
      .insert({ name, slug, description, image })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
