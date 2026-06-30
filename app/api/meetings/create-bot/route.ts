import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { meetingUrl, botName } = await request.json();

    if (!meetingUrl) {
      return NextResponse.json(
        { error: "meetingUrl is required" },
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
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create bot", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ botId: data.id, status: data });
  } catch (error) {
    console.error("Error creating Recall bot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}