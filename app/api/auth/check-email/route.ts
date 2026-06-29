// app/api/auth/check-email/route.ts
// POST /api/auth/check-email
// Checks via Firebase Admin if an email has an existing account
// Used by invite/accept to decide new user vs existing user flow

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    try {
      await adminAuth.getUserByEmail(email);
      // If we get here, user EXISTS
      return NextResponse.json({ exists: true }, { status: 200 });
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        return NextResponse.json({ exists: false }, { status: 200 });
      }
      throw err;
    }
  } catch (err) {
    console.error("[/api/auth/check-email] Error:", err);
    return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
  }
}