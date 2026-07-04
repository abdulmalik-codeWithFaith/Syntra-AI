import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, placeholderMemberId } = await req.json();

    if (!workspaceId || !placeholderMemberId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Delete the placeholder member doc that was created with inviteKey as ID
    await adminDb
      .doc(`workspaces/${workspaceId}/members/${placeholderMemberId}`)
      .delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/team/remove-placeholder] Error:", err);
    return NextResponse.json({ error: "Failed to remove placeholder" }, { status: 500 });
  }
}