// app/api/integrations/google/callback/route.ts
// GET /api/integrations/google/callback
// Handles OAuth redirect from Google, exchanges code for tokens, saves to Firestore

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const uid   = searchParams.get("state"); // we passed uid as state
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // User denied access
  if (error || !code || !uid) {
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=access_denied`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens = await tokenRes.json();
    // tokens: { access_token, refresh_token, expires_in, token_type, scope }

    // 2. Get the user's Google email
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    // 3. Save tokens to Firestore under users/{uid}/integrations/google
    await adminDb.doc(`users/${uid}/integrations/google`).set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      scope: tokens.scope,
      connectedEmail: userInfo.email ?? "",
      connectedAt: FieldValue.serverTimestamp(),
    });

    // 4. Redirect back to integrations page with success
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?connected=google`);
  } catch (err) {
    console.error("[/api/integrations/google/callback] Error:", err);
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=token_exchange_failed`);
  }
}