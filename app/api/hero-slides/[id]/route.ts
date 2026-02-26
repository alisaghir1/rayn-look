import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError, pickFields } from '@/lib/auth';

// GET /api/hero-slides/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('HeroSlide')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    return NextResponse.json({ slide: data });
  } catch (error) {
    console.error('GET /api/hero-slides/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero slide' }, { status: 500 });
  }
}

// PUT /api/hero-slides/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const safeBody = pickFields(body, [
      'subtitle', 'title', 'highlight', 'description',
      'ctaLabel', 'ctaHref', 'ctaSecondaryLabel', 'ctaSecondaryHref',
      'bgImage', 'bgGradient', 'sortOrder', 'active',
    ]);

    const { data, error } = await supabaseAdmin
      .from('HeroSlide')
      .update(safeBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ slide: data });
  } catch (error) {
    console.error('PUT /api/hero-slides/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
  }
}

// DELETE /api/hero-slides/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from('HeroSlide').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/hero-slides/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
  }
}
