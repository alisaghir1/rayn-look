import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  verifyPassword,
  hashPassword,
  createSessionToken,
  parseSessionToken,
  checkRateLimit,
  resetRateLimit,
} from '@/lib/auth';

// POST /api/admin/auth — Login
export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Sanitize & find admin user
    const sanitizedEmail = email.toLowerCase().trim();
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('id, email, name, password, role')
      .eq('email', sanitizedEmail)
      .eq('role', 'ADMIN')
      .single();

    if (error || !user) {
      // Generic error to prevent user enumeration
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password (supports both legacy plain-text and hashed)
    const passwordValid = verifyPassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Auto-migrate plain-text password to hashed on successful login
    if (!user.password.includes(':')) {
      const hashed = hashPassword(password);
      await supabaseAdmin
        .from('User')
        .update({ password: hashed })
        .eq('id', user.id);
    }

    // Reset rate limit on successful login
    resetRateLimit(ip);

    // Create HMAC-signed session token
    const token = createSessionToken(user.id, user.email);

    // Set HTTP-only cookie on the response object
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'lax' is mobile-friendly (iOS Safari) and still safe for admin POSTs from same-origin forms
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// DELETE /api/admin/auth — Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

// GET /api/admin/auth — Check session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify HMAC-signed token
    const parsed = parseSessionToken(token);
    if (!parsed) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify user still exists and is admin
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role')
      .eq('id', parsed.userId)
      .eq('role', 'ADMIN')
      .single();

    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
