import { NextRequest, NextResponse } from "next/server";
import { insertAct } from "@/lib/db";
import type { SubmissionPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SubmissionPayload>;

    // Server-side validation
    if (
      !body.name?.trim() ||
      !body.email?.trim() ||
      !body.ward_name?.trim() ||
      !body.act_description?.trim() ||
      !["this", "other"].includes(body.side_of_veil ?? "")
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    insertAct({
      name: body.name.trim(),
      email: body.email.trim(),
      ward_name: body.ward_name.trim(),
      side_of_veil: body.side_of_veil as "this" | "other",
      act_description: body.act_description.trim(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
