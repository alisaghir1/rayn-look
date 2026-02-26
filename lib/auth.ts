import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// ─── Secret Key ───────────────────────────────────────────────
const SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ─── Password Hashing (scrypt — built-in Node.js, no deps) ───
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  // Support legacy plain-text passwords (no colon = old format)
  if (!stored.includes(':')) {
    return password === stored;
  }
  const [salt, hash] = stored.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return timingSafeEqual(hashBuffer, derivedKey);
}

// ─── HMAC-Signed Session Tokens ───────────────────────────────
function signToken(payload: string): string {
  const hmac = createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${hmac}`;
}

function verifyToken(token: string): string | null {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const payloadB64 = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
  } catch {
    return null;
  }

  const expected = createHmac('sha256', SECRET).update(payload).digest('hex');

  // Timing-safe comparison
  if (signature.length !== expected.length) return null;
  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;

  // Check token expiration
  const parts = payload.split(':');
  if (parts.length < 3) return null;
  const timestamp = parseInt(parts[2]);
  if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_MAX_AGE) return null;

  return payload;
}

export function createSessionToken(userId: string, email: string): string {
  const payload = `${userId}:${email}:${Date.now()}`;
  return signToken(payload);
}

export function parseSessionToken(token: string): { userId: string; email: string } | null {
  const payload = verifyToken(token);
  if (!payload) return null;
  const [userId, email] = payload.split(':');
  if (!userId || !email) return null;
  return { userId, email };
}

// ─── Middleware-compatible token check (no DB, fast) ──────────
export function validateTokenFormat(token: string): boolean {
  return parseSessionToken(token) !== null;
}

// ─── API Route Auth Guard ─────────────────────────────────────
// Call this at the start of any protected API route handler
export async function requireAdmin(): Promise<
  { user: { id: string; name: string; email: string } } | NextResponse
> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const parsed = parseSessionToken(token);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Verify user still exists and is still admin
  const { data: user, error } = await supabaseAdmin
    .from('User')
    .select('id, name, email, role')
    .eq('id', parsed.userId)
    .eq('role', 'ADMIN')
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user: { id: user.id, name: user.name, email: user.email } };
}

/** Helper: returns true if the result is an unauthorized response */
export function isAuthError(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

// ─── Rate Limiter (in-memory, per-IP) ─────────────────────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true; // allowed
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

// Clean up stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now - record.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 30 * 60 * 1000);

// ─── Input Sanitization ──────────────────────────────────────
/** Sanitize a string for use in Supabase filter expressions (prevent filter injection) */
export function sanitizeSearchInput(input: string): string {
  // Remove characters that could break Supabase PostgREST filter syntax
  return input.replace(/[%_'"\\(),.;]/g, '').trim().slice(0, 100);
}

/** Pick only allowed fields from an object (prevent column injection) */
export function pickFields<T extends Record<string, unknown>>(
  body: T,
  allowedFields: string[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (result as Record<string, unknown>)[field] = body[field];
    }
  }
  return result;
}
