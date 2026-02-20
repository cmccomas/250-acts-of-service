import { NextResponse } from "next/server";
import { getWardStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    const stats = getWardStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("ward-stats error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
