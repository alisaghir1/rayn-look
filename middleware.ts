import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

// ─── HMAC token verification (duplicated from lib/auth for Edge Runtime) ───
const SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function verifyTokenInMiddleware(token: string): boolean {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const payloadB64 = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
  } catch {
    return false;
  }

  const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
  if (signature !== expected) return false;

  // Check expiration
  const parts = payload.split(':');
  if (parts.length < 3) return false;
  const timestamp = parseInt(parts[2]);
  if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_MAX_AGE) return false;

  return true;
}

// ─── Security Headers ─────────────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Protect Admin API Routes ────────────────────────────────
  // Allow the auth endpoint (login/logout/check) without a token
  if (pathname.startsWith('/api/admin/auth')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Protect all other /api/admin/* routes, /api/upload, /api/customers (admin-only),
  // and write endpoints for /api/celebrities, /api/testimonials, /api/hero-slides,
  // /api/products, /api/orders, /api/inventory, /api/categories
  const protectedApiPrefixes = [
    '/api/admin/',
    '/api/upload',
    '/api/inventory',
    '/api/customers',
  ];

  const isProtectedApi = protectedApiPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // For resource APIs, protect POST/PUT/DELETE (write ops) but allow GET (public reads)
  const resourceApiPrefixes = [
    '/api/celebrities',
    '/api/testimonials',
    '/api/hero-slides',
    '/api/products',
    '/api/orders',
    '/api/categories',
  ];
  const isResourceApi = resourceApiPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isWriteMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
    request.method
  );

  if (isProtectedApi || (isResourceApi && isWriteMethod)) {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !verifyTokenInMiddleware(token)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ─── Protect Admin Pages ─────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Allow the login page itself
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin_session')?.value;
      if (token && verifyTokenInMiddleware(token)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return addSecurityHeaders(NextResponse.next());
    }

    // Check for valid admin session cookie
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !verifyTokenInMiddleware(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/upload/:path*',
    '/api/inventory/:path*',
    '/api/customers/:path*',
    '/api/celebrities/:path*',
    '/api/testimonials/:path*',
    '/api/hero-slides/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/categories/:path*',
  ],
};
