// app/api/team/remove-member/route.ts
// POST /api/team/remove-member
// Called when an Owner or Admin removes a member from the workspace

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { memberId, workspaceId, callerUid } = await req.json();

    if (!memberId || !workspaceId || !callerUid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // ── Cannot remove Owner ─────────────────────────────────────────────────
    const targetSnap = await adminDb
      .doc(`workspaces/${workspaceId}/members/${memberId}`)
      .get();

    if (!targetSnap.exists) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetSnap.data()?.role === "Owner") {
      return NextResponse.json({ error: "Cannot remove the workspace Owner" }, { status: 403 });
    }

    const memberData = targetSnap.data()!;

    // ── Remove from workspace members ───────────────────────────────────────
    await adminDb
      .doc(`workspaces/${workspaceId}/members/${memberId}`)
      .delete();

    // ── Remove workspaceId from user doc (if they have a real uid) ──────────
    // Invited-but-not-yet-accepted members use inviteKey as uid — skip those
    if (memberData.status === "Active" && memberData.uid) {
      const userRef = adminDb.doc(`users/${memberData.uid}`);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.update({
          workspaceIds: FieldValue.arrayRemove(workspaceId),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    // ── If they were only invited, also delete the invite doc ───────────────
    if (memberData.status === "Invited") {
      const inviteSnap = await adminDb
        .collection("invites")
        .where("email", "==", memberData.email)
        .where("workspaceId", "==", workspaceId)
        .where("consumed", "==", false)
        .get();

      const batch = adminDb.batch();
      inviteSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/team/remove-member] Error:", err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}