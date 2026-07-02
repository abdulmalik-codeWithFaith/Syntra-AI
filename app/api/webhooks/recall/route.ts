import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateMeetingPDF } from "@/lib/generate-pdf";
import { uploadPDFToCloudinary } from "@/lib/upload-cloudinary";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const event = payload.event;
    const botId = payload.data?.bot?.id;

    console.log("Recall webhook received:", event, botId);

    if (event.startsWith("bot.") && botId) {
      const statusCode = payload.data?.data?.code;
      if (statusCode) {
        const meetingsQuery = await adminDb
          .collectionGroup("meetings")
          .where("botId", "==", botId)
          .limit(1)
          .get();

        if (!meetingsQuery.empty) {
          const meetingDoc = meetingsQuery.docs[0];
          await meetingDoc.ref.update({
            recallBotStatus: statusCode,
            updatedAt: new Date(),
          });
        }
      }
    }

    if (event === "bot.done" && botId) {
      const region = process.env.RECALLAI_REGION;
      const apiKey = process.env.RECALLAI_API_KEY;

      const meetingsQuery = await adminDb
        .collectionGroup("meetings")
        .where("botId", "==", botId)
        .limit(1)
        .get();

      if (meetingsQuery.empty) {
        console.error("No meeting found for botId:", botId);
        return NextResponse.json({ received: true });
      }

      const meetingDoc = meetingsQuery.docs[0];
      const meetingData = meetingDoc.data();
      const workspaceId = meetingData.workspaceId;
      const meetingId = meetingDoc.id;

      await meetingDoc.ref.update({
        status: "Processing",
        updatedAt: new Date(),
      });

      // Fetch bot data to get transcript download URL
      const botRes = await fetch(
        `https://${region}.recall.ai/api/v1/bot/${botId}`,
        { headers: { Authorization: `Token ${apiKey}` } }
      );
      const botData = await botRes.json();

      const transcriptDownloadUrl =
        botData?.recordings?.[0]?.media_shortcuts?.transcript?.data?.download_url;

      if (!transcriptDownloadUrl) {
        console.error("No transcript URL found");
        return NextResponse.json({ received: true });
      }

      // Fetch transcript
      const transcriptRes = await fetch(transcriptDownloadUrl);
      const transcriptLines = await transcriptRes.json();

      // Write transcript to Firestore
      const transcriptRef = meetingDoc.ref.collection("transcript");
      const batch = adminDb.batch();

      for (const line of transcriptLines) {
        for (const word of line.words) {
          const lineRef = transcriptRef.doc();
          batch.set(lineRef, {
            id: lineRef.id,
            speaker: line.participant.name,
            isAgent: false,
            text: word.text,
            timestampMs: Math.round(word.start_timestamp.relative * 1000),
            createdAt: new Date(),
          });
        }
      }

      await batch.commit();
      console.log("Transcript written to Firestore for meeting:", meetingId);

      // Build full transcript text for Gemini
      const fullTranscript = transcriptLines
        .flatMap((line: any) =>
          line.words.map((w: any) => `${line.participant.name}: ${w.text}`)
        )
        .join("\n");

      // Call Gemini
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI meeting assistant. Analyze this meeting transcript and extract:
1. A concise summary (2-3 sentences)
2. Action items/tasks (with owner name and deadline if mentioned)
3. Key decisions made

Transcript:
${fullTranscript}

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "summary": "...",
  "tasks": [
    { "title": "...", "ownerName": "...", "deadline": "YYYY-MM-DD or null" }
  ],
  "decisions": [
    { "text": "..." }
  ]
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const geminiData = await geminiRes.json();
      console.log("Gemini raw response:", JSON.stringify(geminiData, null, 2));
      const rawText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const extracted = JSON.parse(cleanJson);
      console.log("Gemini extracted:", JSON.stringify(extracted, null, 2));

      // Write summary
      await meetingDoc.ref.update({
        summary: extracted.summary || "",
        transcriptGenerated: true,
        status: "Completed",
        endedAt: new Date(),
        updatedAt: new Date(),
      });

      // Write tasks
      const tasksBatch = adminDb.batch();
      for (const task of extracted.tasks || []) {
        const taskRef = adminDb
          .collection("workspaces")
          .doc(workspaceId)
          .collection("tasks")
          .doc();

        tasksBatch.set(taskRef, {
          id: taskRef.id,
          workspaceId,
          meetingId,
          meetingTitle: meetingData.title || "Meeting",
          title: task.title,
          ownerName: task.ownerName || null,
          deadline: task.deadline ? new Date(task.deadline) : null,
          status: "Pending",
          overdue: false,
          extractedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await tasksBatch.commit();

      // Write decisions
      const decisionsBatch = adminDb.batch();
      for (const decision of extracted.decisions || []) {
        const decisionRef = meetingDoc.ref.collection("decisions").doc();
        decisionsBatch.set(decisionRef, {
          id: decisionRef.id,
          text: decision.text,
          timestampMs: 0,
          createdAt: new Date(),
        });
      }
      await decisionsBatch.commit();

      // Update counts
      await meetingDoc.ref.update({
        taskCount: (extracted.tasks || []).length,
        decisionCount: (extracted.decisions || []).length,
        updatedAt: new Date(),
      });

      // Generate and upload PDF
      // Generate and upload PDF
let pdfUrl: string | null = null;
try {
  const transcriptSnap = await meetingDoc.ref
    .collection("transcript")
    .orderBy("timestampMs", "asc")
    .get();

  const transcriptForPDF = transcriptSnap.docs.map((d) => ({
    speaker: d.data().speaker,
    text: d.data().text,
  }));

  const pdfBytes = await generateMeetingPDF({
    title: meetingData.title || "Meeting",
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    platform: meetingData.platform || "Google Meet",
    summary: extracted.summary || "",
    tasks: extracted.tasks || [],
    decisions: extracted.decisions || [],
    transcript: transcriptForPDF,
  });

  const fileName = `meeting-${meetingId}-${Date.now()}`;
  const { url, sizeKB } = await uploadPDFToCloudinary(pdfBytes, fileName);
  pdfUrl = url;

  await meetingDoc.ref.update({
    pdfUrl: url,
    pdfSizeKB: sizeKB,
    updatedAt: new Date(),
  });

  console.log("PDF uploaded:", url);
} catch (pdfError) {
  console.error("PDF generation failed:", pdfError);
}

      console.log("All data written to Firestore for meeting:", meetingId);
      // Write notifications to all workspace members
const membersSnap = await adminDb
  .collection("workspaces")
  .doc(workspaceId)
  .collection("members")
  .where("status", "==", "Active")
  .get();

for (const member of membersSnap.docs) {
  const uid = member.id;
  const notifRef = adminDb.collection("users").doc(uid).collection("notifications");

  // Meeting summary notification
  await notifRef.doc().set({
    id: notifRef.doc().id,
    type: "meeting_summary",
    title: `Summary ready — ${meetingData.title || "Meeting"}`,
    description: `Your meeting summary is ready with ${(extracted.tasks || []).length} tasks and ${(extracted.decisions || []).length} decisions extracted.`,
    read: false,
    meetingId,
    meetingTitle: meetingData.title || "Meeting",
    actionLabel: "View summary",
    actionHref: `/dashboard/meetings/${meetingId}`,
    createdAt: new Date(),
  });

  // Task extracted notification
  if ((extracted.tasks || []).length > 0) {
    await notifRef.doc().set({
      id: notifRef.doc().id,
      type: "task_extracted",
      title: `${extracted.tasks.length} task${extracted.tasks.length > 1 ? "s" : ""} extracted from ${meetingData.title || "Meeting"}`,
      description: `Syntra extracted ${extracted.tasks.length} new task${extracted.tasks.length > 1 ? "s" : ""} from ${meetingData.title || "Meeting"}.`,
      read: false,
      meetingId,
      meetingTitle: meetingData.title || "Meeting",
      actionLabel: "View tasks",
      actionHref: "/dashboard/tasks",
      createdAt: new Date(),
    });
  }

  // PDF notification
  if (pdfUrl) {
    await notifRef.doc().set({
      id: notifRef.doc().id,
      type: "pdf_generated",
      title: `PDF report generated`,
      description: `The ${meetingData.title || "Meeting"} report is ready to download.`,
      read: false,
      meetingId,
      meetingTitle: meetingData.title || "Meeting",
      actionLabel: "Download PDF",
      actionHref: "/dashboard/reports",
      createdAt: new Date(),
    });
  }
}
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling Recall webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}