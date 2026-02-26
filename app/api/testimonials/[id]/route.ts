import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError, pickFields } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/testimonials/:id
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { data, error } = await supabaseAdmin
      .from('Testimonial')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 });
  }
}

// PUT /api/testimonials/:id
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const safeBody = pickFields(body, [
      'name', 'location', 'avatar', 'rating', 'title', 'text',
      'product', 'featured', 'active',
    ]);

    const { data, error } = await supabaseAdmin
      .from('Testimonial')
      .update(safeBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials/:id
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await context.params;
    const { error } = await supabaseAdmin
      .from('Testimonial')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/testimonials/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
