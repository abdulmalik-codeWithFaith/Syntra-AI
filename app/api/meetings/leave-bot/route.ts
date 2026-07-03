import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: "meetingId is required" }, { status: 400 });
    }

    // Find the meeting doc
    const meetingsQuery = await adminDb
      .collectionGroup("meetings")
      .where("id", "==", meetingId)
      .limit(1)
      .get();

    if (meetingsQuery.empty) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const meetingDoc = meetingsQuery.docs[0];
    const botId = meetingDoc.data().botId;

    if (!botId) {
      return NextResponse.json({ error: "No bot found for this meeting" }, { status: 404 });
    }

    // Tell Recall to leave the meeting
    const region = process.env.RECALLAI_REGION;
    const apiKey = process.env.RECALLAI_API_KEY;

    const res = await fetch(
      `https://${region}.recall.ai/api/v1/bot/${botId}/leave_call`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: "Failed to remove bot", details: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave bot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}