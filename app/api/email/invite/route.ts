// app/api/email/invite/route.ts
// POST /api/email/invite
// Called from team page when owner/admin invites a new member
// Writes invite doc to Firestore + sends branded invite email via Nodemailer

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/mailer";
import { inviteEmailTemplate } from "@/lib/email/templates";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { email, role, workspaceId, invitedByUid } = await req.json();

    if (!email || !role || !workspaceId || !invitedByUid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── 1. Verify the caller is Owner or Admin ──────────────────────────────
    const callerSnap = await adminDb
      .doc(`workspaces/${workspaceId}/members/${invitedByUid}`)
      .get();

    if (!callerSnap.exists) {
      return NextResponse.json({ error: "Not a workspace member" }, { status: 403 });
    }

    const callerRole = callerSnap.data()?.role;
    if (callerRole !== "Owner" && callerRole !== "Admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // ── 2. Get workspace info ───────────────────────────────────────────────
    const workspaceSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
    if (!workspaceSnap.exists) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    const workspace = workspaceSnap.data()!;

    // ── 3. Get inviter's name ───────────────────────────────────────────────
    const inviterRecord = await adminAuth.getUser(invitedByUid);
    const invitedByName = inviterRecord.displayName ?? inviterRecord.email ?? "Your team";

    // ── 4. Check if email is already a member ──────────────────────────────
    const existingMembers = await adminDb
      .collection(`workspaces/${workspaceId}/members`)
      .where("email", "==", email)
      .get();

    if (!existingMembers.empty) {
      return NextResponse.json({ error: "This person is already a member of the workspace" }, { status: 409 });
    }

    // ── 5. Create invite doc ────────────────────────────────────────────────
    const inviteKey = nanoid(32);
    await adminDb.doc(`invites/${inviteKey}`).set({
      inviteKey,
      email,
      role,
      workspaceId,
      workspaceName: workspace.workspaceName,
      invitedByUid,
      invitedByName,
      consumed: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // ── 6. Write placeholder member doc ────────────────────────────────────
    await adminDb.doc(`workspaces/${workspaceId}/members/${inviteKey}`).set({
      uid: inviteKey,           // placeholder — replaced on accept
      email,
      fullName: email.split("@")[0],
      photoURL: null,
      role,
      status: "Invited",
      joinedAt: null,
      invitedAt: FieldValue.serverTimestamp(),
    });

    // ── 7. Build invite link ────────────────────────────────────────────────
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${inviteKey}&workspace=${workspaceId}&name=${encodeURIComponent(workspace.workspaceName)}&invitedBy=${encodeURIComponent(invitedByName)}&email=${encodeURIComponent(email)}`;

    // ── 8. Send branded email ───────────────────────────────────────────────
    const { subject, html, text } = inviteEmailTemplate({
      invitedByName,
      workspaceName: workspace.workspaceName,
      email,
      inviteLink,
    });

    await sendEmail({ to: email, subject, html, text });

    return NextResponse.json({ success: true, inviteKey }, { status: 200 });
  } catch (err) {
    console.error("[/api/email/invite] Error:", err);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}