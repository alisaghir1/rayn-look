import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth';

// POST /api/upload — Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (SVG excluded to prevent XSS)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${folder}/${timestamp}-${random}.${ext}`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      // If bucket doesn't exist, try to create it
      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        await supabaseAdmin.storage.createBucket('images', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        });
        // Retry upload
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from('images')
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: false,
          });
        if (retryError) throw retryError;
        const { data: urlData } = supabaseAdmin.storage.from('images').getPublicUrl(retryData.path);
        return NextResponse.json({ url: urlData.publicUrl, path: retryData.path }, { status: 201 });
      }
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl, path: data.path }, { status: 201 });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// DELETE /api/upload — Delete image from Supabase Storage
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage.from('images').remove([path]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/upload error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
