// app/api/email/send-password-reset/route.ts
// POST /api/email/send-password-reset
// Called from forgot-password page
// Sends branded password reset email via Nodemailer

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/mailer";
import { passwordResetEmailTemplate } from "@/lib/email/templates";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a Firebase password reset link via Admin SDK
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    });

    const { subject, html, text } = passwordResetEmailTemplate({ fullName, resetLink });

    await sendEmail({ to: email, subject, html, text });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    // If user doesn't exist, return 200 anyway — don't reveal account existence
    if (err?.errorInfo?.code === "auth/user-not-found") {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    console.error("[/api/email/send-password-reset] Error:", err);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}