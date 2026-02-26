import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role key, bypasses RLS)
// Only use this in API routes and server components — NEVER expose to client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
