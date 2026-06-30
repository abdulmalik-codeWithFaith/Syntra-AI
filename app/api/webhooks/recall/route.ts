import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("Recall webhook received:", JSON.stringify(payload, null, 2));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling Recall webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}