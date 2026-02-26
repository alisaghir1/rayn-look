import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/celebrities — List all active celebrities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true'; // admin flag to get inactive too

    let query = supabaseAdmin
      .from('Celebrity')
      .select('*')
      .order('sortOrder', { ascending: true });

    if (!all) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ celebrities: data || [] });
  } catch (error) {
    console.error('GET /api/celebrities error:', error);
    return NextResponse.json({ error: 'Failed to fetch celebrities' }, { status: 500 });
  }
}

// POST /api/celebrities — Create a celebrity
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { name, role, lensColor, image, quote, instagram, sortOrder, active } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('Celebrity')
      .insert({
        name,
        role: role || null,
        lensColor: lensColor || null,
        image: image || null,
        quote: quote || null,
        instagram: instagram || null,
        sortOrder: sortOrder || 0,
        active: active !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/celebrities error:', error);
    return NextResponse.json({ error: 'Failed to create celebrity' }, { status: 500 });
  }
}
