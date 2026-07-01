import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { meetingUrl, botName, workspaceId, meetingId } = await request.json();

    if (!meetingUrl || !workspaceId || !meetingId) {
      return NextResponse.json(
        { error: "meetingUrl, workspaceId, and meetingId are required" },
        { status: 400 }
      );
    }

    const region = process.env.RECALLAI_REGION;
    const apiKey = process.env.RECALLAI_API_KEY;

    const response = await fetch(`https://${region}.recall.ai/api/v1/bot`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: botName || "Syntra Bot",
        recording_config: {
          transcript: {
            provider: {
              meeting_captions: {}
            }
          }
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create bot", details: data },
        { status: response.status }
      );
    }

    // Save botId to the Firestore meeting document
    await adminDb
      .collection("workspaces")
      .doc(workspaceId)
      .collection("meetings")
      .doc(meetingId)
      .update({
        botId: data.id,
        recallBotStatus: "joining_call",
        status: "Live",
        updatedAt: new Date(),
      });

    return NextResponse.json({ botId: data.id });
  } catch (error) {
    console.error("Error creating Recall bot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}