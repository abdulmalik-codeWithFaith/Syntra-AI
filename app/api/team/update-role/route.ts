// app/api/team/update-role/route.ts
// POST /api/team/update-role
// Called when an Owner or Admin changes a member's role

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { memberId, newRole, workspaceId, callerUid } = await req.json();

    if (!memberId || !newRole || !workspaceId || !callerUid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["Member", "Admin"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // ── Verify caller is Owner or Admin ─────────────────────────────────────
    const callerSnap = await adminDb
      .doc(`workspaces/${workspaceId}/members/${callerUid}`)
      .get();

    if (!callerSnap.exists) {
      return NextResponse.json({ error: "Not a workspace member" }, { status: 403 });
    }

    const callerRole = callerSnap.data()?.role;
    if (callerRole !== "Owner" && callerRole !== "Admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // ── Cannot change the Owner's role ──────────────────────────────────────
    const targetSnap = await adminDb
      .doc(`workspaces/${workspaceId}/members/${memberId}`)
      .get();

    if (!targetSnap.exists) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetSnap.data()?.role === "Owner") {
      return NextResponse.json({ error: "Cannot change the Owner's role" }, { status: 403 });
    }

    // ── Update role ─────────────────────────────────────────────────────────
    await adminDb
      .doc(`workspaces/${workspaceId}/members/${memberId}`)
      .update({ role: newRole, updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/team/update-role] Error:", err);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}