// app/api/integrations/google/meetings/route.ts
// GET /api/integrations/google/meetings?uid=xxx
// Fetches upcoming Google Calendar events for the user

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to refresh token");
  return data.access_token;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    // 1. Get stored tokens
    const tokenSnap = await adminDb.doc(`users/${uid}/integrations/google`).get();
    if (!tokenSnap.exists) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 404 });
    }

    const tokenData = tokenSnap.data()!;
    let accessToken: string = tokenData.accessToken;

    // 2. Refresh token if expired (with 5 min buffer)
    if (tokenData.expiresAt < Date.now() - 5 * 60 * 1000) {
      if (!tokenData.refreshToken) {
        return NextResponse.json({ error: "Token expired and no refresh token available" }, { status: 401 });
      }
      accessToken = await refreshAccessToken(tokenData.refreshToken);
      // Update stored access token
      await adminDb.doc(`users/${uid}/integrations/google`).update({
        accessToken,
        expiresAt: Date.now() + 3600 * 1000,
      });
    }

    // 3. Fetch upcoming events from Google Calendar
    const now = new Date().toISOString();
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: now,
        timeMax: oneMonthLater,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "20",
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!calRes.ok) {
      throw new Error("Failed to fetch calendar events");
    }

    const calData = await calRes.json();

    // 4. Filter and shape events — only return ones with a video link
    const meetings = (calData.items ?? [])
      .filter((event: any) =>
        event.status !== "cancelled" &&
        (event.hangoutLink || event.conferenceData?.entryPoints?.some((ep: any) => ep.entryPointType === "video"))
      )
      .map((event: any) => {
        const videoEntry = event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video");
        return {
          id: event.id,
          title: event.summary ?? "Untitled Meeting",
          start: event.start?.dateTime ?? event.start?.date,
          end: event.end?.dateTime ?? event.end?.date,
          meetLink: event.hangoutLink ?? videoEntry?.uri ?? null,
          platform: event.hangoutLink ? "Google Meet" : "Video Call",
          attendees: (event.attendees ?? []).map((a: any) => ({
            email: a.email,
            name: a.displayName ?? a.email,
            self: a.self ?? false,
          })),
          description: event.description ?? null,
          location: event.location ?? null,
        };
      });

    return NextResponse.json({ meetings, connectedEmail: tokenData.connectedEmail }, { status: 200 });
  } catch (err) {
    console.error("[/api/integrations/google/meetings] Error:", err);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}