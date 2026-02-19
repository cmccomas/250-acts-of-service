import { NextResponse } from "next/server";
import { getRandomApprovedActs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const acts = getRandomApprovedActs(6);
    return NextResponse.json({ acts });
  } catch (err) {
    console.error("Acts fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load acts." },
      { status: 500 }
    );
  }
}
