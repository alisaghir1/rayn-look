import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// GET /api/admin/settings
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { data: settings } = await supabaseAdmin
      .from('SiteSettings')
      .select()
      .eq('id', 'default')
      .single();

    if (!settings) {
      // Auto-create default settings
      const { data: created, error } = await supabaseAdmin
        .from('SiteSettings')
        .insert({ id: 'default' })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(created);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/admin/settings
export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.siteName !== undefined) updateData.siteName = body.siteName;
    if (body.siteDescription !== undefined) updateData.siteDescription = body.siteDescription;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.taxRate !== undefined) updateData.taxRate = parseFloat(body.taxRate);
    if (body.shippingRate !== undefined) updateData.shippingRate = parseFloat(body.shippingRate);
    if (body.freeShippingMinimum !== undefined) updateData.freeShippingMin = parseFloat(body.freeShippingMinimum);
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(body.lowStockThreshold);
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail;
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.socialInstagram !== undefined) updateData.socialInstagram = body.socialInstagram;
    if (body.socialTwitter !== undefined) updateData.socialTwitter = body.socialTwitter;
    if (body.socialFacebook !== undefined) updateData.socialFacebook = body.socialFacebook;
    if (body.socialTiktok !== undefined) updateData.socialTiktok = body.socialTiktok;

    // Upsert: try update first, insert if not found
    const { data: existing } = await supabaseAdmin
      .from('SiteSettings')
      .select('id')
      .eq('id', 'default')
      .single();

    let settings;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('SiteSettings')
        .update(updateData)
        .eq('id', 'default')
        .select()
        .single();
      if (error) throw error;
      settings = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('SiteSettings')
        .insert({ id: 'default', ...updateData })
        .select()
        .single();
      if (error) throw error;
      settings = data;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
