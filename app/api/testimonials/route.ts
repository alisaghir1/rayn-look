import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/testimonials — List all active testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let query = supabaseAdmin
      .from('Testimonial')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!all) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ testimonials: data || [] });
  } catch (error) {
    console.error('GET /api/testimonials error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST /api/testimonials — Create a testimonial
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { name, location, avatar, rating, title, text, product, featured, active } = body;

    if (!name || !title || !text) {
      return NextResponse.json({ error: 'Name, title, and text are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('Testimonial')
      .insert({
        name,
        location: location || null,
        avatar: avatar || '👩🏻',
        rating: rating || 5,
        title,
        text,
        product: product || null,
        featured: featured !== false,
        active: active !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/testimonials error:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
