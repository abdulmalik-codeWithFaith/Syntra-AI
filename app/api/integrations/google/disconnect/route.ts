// app/api/integrations/google/disconnect/route.ts
// POST /api/integrations/google/disconnect
// Revokes Google OAuth token and removes from Firestore

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    // Get the token to revoke it with Google
    const tokenSnap = await adminDb.doc(`users/${uid}/integrations/google`).get();

    if (tokenSnap.exists) {
      const { accessToken, refreshToken } = tokenSnap.data()!;

      // Revoke with Google (best effort — don't fail if this errors)
      const tokenToRevoke = refreshToken ?? accessToken;
      if (tokenToRevoke) {
        fetch(`https://oauth2.googleapis.com/revoke?token=${tokenToRevoke}`, {
          method: "POST",
        }).catch(() => {});
      }

      // Delete from Firestore
      await adminDb.doc(`users/${uid}/integrations/google`).delete();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/integrations/google/disconnect] Error:", err);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}