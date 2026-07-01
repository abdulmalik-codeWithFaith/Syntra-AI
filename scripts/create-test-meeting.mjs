import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";
import { readFileSync } from "fs";

config({ path: ".env.local" });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

const workspacesSnap = await db.collection("workspaces").limit(1).get();

if (workspacesSnap.empty) {
  console.error("No workspaces found.");
  process.exit(1);
}

const workspaceDoc = workspacesSnap.docs[0];
const workspaceId = workspaceDoc.id;
console.log("Using workspace:", workspaceId);

const meetingRef = db
  .collection("workspaces")
  .doc(workspaceId)
  .collection("meetings")
  .doc();

const meetingId = meetingRef.id;

await meetingRef.set({
  id: meetingId,
  workspaceId,
  title: "Test Meeting",
  platform: "Google Meet",
  meetingLink: "https://meet.google.com/test",
  status: "Upcoming",
  scheduledAt: new Date(),
  attendees: [],
  taskCount: 0,
  decisionCount: 0,
  transcriptGenerated: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

console.log("✅ Meeting created!");
console.log("workspaceId:", workspaceId);
console.log("meetingId:", meetingId);
console.log("\nRun this curl command with a fresh meet.new URL:");
console.log(`curl -X POST http://localhost:3000/api/meetings/create-bot -H "Content-Type: application/json" -d "{\\"meetingUrl\\": \\"https://meet.google.com/YOUR-CODE\\", \\"botName\\": \\"Syntra Bot\\", \\"workspaceId\\": \\"${workspaceId}\\", \\"meetingId\\": \\"${meetingId}\\"}"`);

process.exit(0);