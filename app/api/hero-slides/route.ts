import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/hero-slides — Get all active hero slides (or all with ?all=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let query = supabaseAdmin
      .from('HeroSlide')
      .select('*')
      .order('sortOrder', { ascending: true });

    if (!all) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ slides: data || [] });
  } catch (error) {
    console.error('GET /api/hero-slides error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
  }
}

// POST /api/hero-slides — Create a new hero slide
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { subtitle, title, highlight, description, ctaLabel, ctaHref, ctaSecondaryLabel, ctaSecondaryHref, bgImage, bgGradient, sortOrder, active } = body;

    if (!title || !highlight) {
      return NextResponse.json({ error: 'Title and highlight are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('HeroSlide')
      .insert({
        subtitle: subtitle || '',
        title,
        highlight,
        description: description || '',
        ctaLabel: ctaLabel || 'Shop Now',
        ctaHref: ctaHref || '/shop',
        ctaSecondaryLabel: ctaSecondaryLabel || '',
        ctaSecondaryHref: ctaSecondaryHref || '',
        bgImage: bgImage || '',
        bgGradient: bgGradient || 'from-dark/95 via-dark/70 to-dark/40',
        sortOrder: sortOrder || 0,
        active: active !== false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ slide: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/hero-slides error:', error);
    return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
  }
}
