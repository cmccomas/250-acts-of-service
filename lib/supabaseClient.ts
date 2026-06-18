import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client for the public resource signup form.
// Uses the PUBLIC anon key, which is safe to expose: Row Level Security
// on resource_offers limits the anon key to INSERT only (no reads).
//
// The placeholder fallbacks keep the build from failing before the real
// environment variables are configured. The form only works once the
// real NEXT_PUBLIC_SUPABASE_* values are set in Vercel (and .env.local).

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabaseBrowser = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
