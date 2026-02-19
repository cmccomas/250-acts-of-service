import { NextResponse } from "next/server";
import { getProgressCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const counts = getProgressCounts();
    return NextResponse.json(counts);
  } catch (err) {
    console.error("Progress fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load progress." },
      { status: 500 }
    );
  }
}
