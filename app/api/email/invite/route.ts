

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/mailer";
import { inviteEmailTemplate } from "@/lib/email/templates";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InviteEmailBody {
  emails: string[];
  workspaceId: string;
  workspaceName: string;
  invitedByName: string;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: InviteEmailBody = await req.json();
    const { emails, workspaceId, workspaceName, invitedByName } = body;

    if (!emails?.length || !workspaceId || !workspaceName || !invitedByName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        // Invite key: email with dots replaced (matches Firestore invite doc key)
        const inviteKey = email.toLowerCase().trim().replace(/\./g, "_");

        // Build the invite link — invited member lands here, sets password, joins workspace
        const inviteLink = `${APP_URL}/invite/accept?token=${encodeURIComponent(inviteKey)}&workspace=${encodeURIComponent(workspaceId)}&name=${encodeURIComponent(workspaceName)}&invitedBy=${encodeURIComponent(invitedByName)}&email=${encodeURIComponent(email.toLowerCase().trim())}`;

        const { subject, html, text } = inviteEmailTemplate({
          invitedByName,
          workspaceName,
          email: email.toLowerCase().trim(),
          inviteLink,
        });

        await sendEmail({ to: email, subject, html, text });
        return { email, status: "sent" };
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed }, { status: 200 });
  } catch (err) {
    console.error("[/api/email/invite] Error:", err);
    return NextResponse.json({ error: "Failed to send invite emails" }, { status: 500 });
  }
}