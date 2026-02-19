import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { approveAct, deleteAct } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID." },
        { status: 400 }
      );
    }

    const { action } = (await req.json()) as { action: string };

    if (action === "approve") {
      const updated = approveAct(id);
      if (!updated) {
        return NextResponse.json(
          { error: "Act not found or already approved." },
          { status: 404 }
        );
      }
    } else if (action === "delete") {
      const deleted = deleteAct(id);
      if (!deleted) {
        return NextResponse.json(
          { error: "Act not found." },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'delete'." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin action error:", err);
    return NextResponse.json(
      { error: "Action failed." },
      { status: 500 }
    );
  }
}
