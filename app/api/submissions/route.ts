import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin-only API route for the Upriver Fire Relief signups.
//
// Security model:
//   - The caller must supply the relief admin password.
//   - We compare it to EMERGENCY_ADMIN_PASSWORD server-side. No match => 401.
//   - On a match we query with the SUPABASE_SERVICE_ROLE_KEY, which bypasses
//     Row Level Security. That key lives ONLY here on the server and is never
//     sent to the browser.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Accept the password from a header or the JSON body.
  let password = req.headers.get("x-admin-password") ?? "";
  if (!password) {
    try {
      const body = await req.json();
      password = typeof body?.password === "string" ? body.password : "";
    } catch {
      // No/!valid JSON body; password stays empty.
    }
  }

  const expected = process.env.EMERGENCY_ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Server is not configured. Missing Supabase settings." },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("resource_offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("submissions query error:", error.message);
    return NextResponse.json(
      { error: "Could not load submissions." },
      { status: 500 }
    );
  }

  return NextResponse.json({ submissions: data ?? [] });
}
