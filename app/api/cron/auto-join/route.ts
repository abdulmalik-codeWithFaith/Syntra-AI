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
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = Date.now();
    const in2Minutes = now + 2 * 60 * 1000;
    const in1Minute = now + 1 * 60 * 1000;

    const workspacesSnap = await adminDb.collection("workspaces").get();
    console.log("Workspaces found:", workspacesSnap.size);

    for (const workspaceDoc of workspacesSnap.docs) {
      const workspaceId = workspaceDoc.id;
      console.log("Checking workspace:", workspaceId);

      const membersSnap = await adminDb
        .collection("workspaces")
        .doc(workspaceId)
        .collection("members")
        .where("status", "==", "Active")
        .get();

      console.log("Members found:", membersSnap.size);

      for (const memberDoc of membersSnap.docs) {
        const uid = memberDoc.id;
        console.log("Checking member uid:", uid);

        const tokenSnap = await adminDb
          .doc(`users/${uid}/integrations/google`)
          .get();

        console.log("Google token exists for uid:", uid, tokenSnap.exists);

        if (!tokenSnap.exists) continue;

        const tokenData = tokenSnap.data()!;
        let accessToken = tokenData.accessToken;

        if (tokenData.expiresAt < now - 5 * 60 * 1000) {
          if (!tokenData.refreshToken) continue;
          try {
            accessToken = await refreshAccessToken(tokenData.refreshToken);
            await adminDb.doc(`users/${uid}/integrations/google`).update({
              accessToken,
              expiresAt: now + 3600 * 1000,
            });
          } catch {
            continue;
          }
        }

        const calRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            new URLSearchParams({
              timeMin: new Date(in1Minute).toISOString(),
              timeMax: new Date(in2Minutes).toISOString(),
              singleEvents: "true",
              orderBy: "startTime",
              maxResults: "10",
            }),
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!calRes.ok) {
          console.log("Calendar fetch failed for uid:", uid);
          continue;
        }

        const calData = await calRes.json();
        const events = calData.items ?? [];

        console.log("Calendar events in window:", events.length);
        console.log("Events:", JSON.stringify(events.map((e: any) => ({
          title: e.summary,
          start: e.start?.dateTime,
          hasHangoutLink: !!e.hangoutLink,
          hasConferenceData: !!e.conferenceData,
        })), null, 2));

        for (const event of events) {
          const meetLink =
            event.hangoutLink ??
            event.conferenceData?.entryPoints?.find(
              (ep: any) => ep.entryPointType === "video"
            )?.uri;

          if (!meetLink) {
            console.log("No meet link for event:", event.summary);
            continue;
          }

          const existingSnap = await adminDb
            .collection("workspaces")
            .doc(workspaceId)
            .collection("meetings")
            .where("calendarEventId", "==", event.id)
            .limit(1)
            .get();

          if (!existingSnap.empty) {
            console.log("Bot already scheduled for event:", event.id);
            continue;
          }

          const meetingRef = adminDb
            .collection("workspaces")
            .doc(workspaceId)
            .collection("meetings")
            .doc();

          const meetingId = meetingRef.id;

          await meetingRef.set({
            id: meetingId,
            workspaceId,
            calendarEventId: event.id,
            title: event.summary ?? "Untitled Meeting",
            platform: "Google Meet",
            meetingLink: meetLink,
            status: "Upcoming",
            scheduledAt: new Date(event.start?.dateTime ?? event.start?.date),
            attendees: (event.attendees ?? []).map((a: any) => ({
              name: a.displayName ?? a.email,
              email: a.email,
              initials: (a.displayName ?? a.email).slice(0, 2).toUpperCase(),
              color: "#6366f1",
            })),
            taskCount: 0,
            decisionCount: 0,
            transcriptGenerated: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          const region = process.env.RECALLAI_REGION;
          const apiKey = process.env.RECALLAI_API_KEY;

          const botRes = await fetch(
            `https://${region}.recall.ai/api/v1/bot`,
            {
              method: "POST",
              headers: {
                Authorization: `Token ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                meeting_url: meetLink,
                bot_name: "Syntra Bot",
                join_at: new Date(
                  event.start?.dateTime ?? event.start?.date
                ).toISOString(),
                recording_config: {
                  transcript: {
                    provider: { meeting_captions: {} },
                  },
                },
              }),
            }
          );

          const botData = await botRes.json();

          if (botRes.ok) {
            await meetingRef.update({
              botId: botData.id,
              recallBotStatus: "scheduled",
              status: "Live",
              updatedAt: new Date(),
            });
            console.log("✅ Bot scheduled for meeting:", event.summary);
          } else {
            console.error("Failed to create bot:", botData);
          }
        }
      }
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Auto-join cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}