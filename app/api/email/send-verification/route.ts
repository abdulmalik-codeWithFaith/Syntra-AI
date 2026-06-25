// app/api/email/send-verification/route.ts
// POST /api/email/send-verification
// Called from signup after createUserWithEmailAndPassword
// Sends branded verification email via Nodemailer (instead of Firebase's default)

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/mailer";
import { verificationEmailTemplate } from "@/lib/email/templates";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, fullName } = await req.json();

    if (!uid || !email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a Firebase email verification link via Admin SDK
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`,
    });

    const { subject, html, text } = verificationEmailTemplate({
      fullName,
      verificationLink,
    });

    await sendEmail({ to: email, subject, html, text });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/email/send-verification] Error:", err);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}