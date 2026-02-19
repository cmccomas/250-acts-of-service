import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAllPendingActs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const acts = getAllPendingActs();
    return NextResponse.json({ acts });
  } catch (err) {
    console.error("Admin acts fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load acts." },
      { status: 500 }
    );
  }
}
