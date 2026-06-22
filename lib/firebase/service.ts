// lib/firebase/services.ts
// All Firestore read/write operations for Syntra AI
// Import these in your pages, Server Components, or API routes

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import type {
  UserDoc,
  WorkspaceDoc,
  MemberDoc,
  AgentConfigDoc,
  MeetingDoc,
  TaskDoc,
  NotificationDoc,
  TranscriptLineDoc,
  DecisionDoc,
  MemberRole,
  WorkspacePlan,
} from "@/lib/firestore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function snap<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// ─── USER ──────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function updateUser(uid: string, data: Partial<UserDoc>): Promise<void> {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
}

export async function markOnboardingComplete(uid: string, workspaceId: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    onboardingComplete: true,
    currentWorkspaceId: workspaceId,
    workspaceIds: [workspaceId],
    updatedAt: serverTimestamp(),
  });
}

// ─── WORKSPACE ────────────────────────────────────────────────────────────────

export async function createWorkspace(
  ownerId: string,
  data: {
    companyName: string;
    workspaceName: string;
    plan?: WorkspacePlan;
    timezone?: string;
    language?: string;
  }
): Promise<string> {
  const ref = doc(collection(db, "workspaces"));
  const workspace: WorkspaceDoc = {
    id: ref.id,
    ownerId,
    companyName: data.companyName,
    workspaceName: data.workspaceName,
    plan: data.plan ?? "starter",
    timezone: data.timezone ?? "UTC",
    language: data.language ?? "English",
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  await setDoc(ref, workspace);
  return ref.id;
}

export async function getWorkspace(workspaceId: string): Promise<WorkspaceDoc | null> {
  const snap = await getDoc(doc(db, "workspaces", workspaceId));
  return snap.exists() ? (snap.data() as WorkspaceDoc) : null;
}

export async function updateWorkspace(workspaceId: string, data: Partial<WorkspaceDoc>): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await deleteDoc(doc(db, "workspaces", workspaceId));
}

// ─── MEMBERS ─────────────────────────────────────────────────────────────────

export async function getMembers(workspaceId: string): Promise<MemberDoc[]> {
  const q = query(collection(db, "workspaces", workspaceId, "members"));
  const snapshot = await getDocs(q);
  return snap<MemberDoc>(snapshot);
}

export async function addMember(
  workspaceId: string,
  member: Omit<MemberDoc, "joinedAt" | "invitedAt"> & { uid: string }
): Promise<void> {
  await setDoc(doc(db, "workspaces", workspaceId, "members", member.uid), {
    ...member,
    status: "Invited",
    joinedAt: null,
    invitedAt: serverTimestamp(),
  });
}

export async function updateMemberRole(workspaceId: string, uid: string, role: MemberRole): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId, "members", uid), { role });
}

export async function removeMember(workspaceId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, "workspaces", workspaceId, "members", uid));
}

export function subscribeMember(
  workspaceId: string,
  uid: string,
  callback: (member: MemberDoc | null) => void
) {
  return onSnapshot(doc(db, "workspaces", workspaceId, "members", uid), (snap) => {
    callback(snap.exists() ? (snap.data() as MemberDoc) : null);
  });
}

// ─── AGENT CONFIG ─────────────────────────────────────────────────────────────

export async function getAgentConfig(workspaceId: string): Promise<AgentConfigDoc | null> {
  const snap = await getDoc(doc(db, "workspaces", workspaceId, "agent", "config"));
  return snap.exists() ? (snap.data() as AgentConfigDoc) : null;
}

export async function setAgentConfig(workspaceId: string, config: Partial<AgentConfigDoc>): Promise<void> {
  await setDoc(
    doc(db, "workspaces", workspaceId, "agent", "config"),
    { ...config, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── MEETINGS ─────────────────────────────────────────────────────────────────

export async function getMeetings(workspaceId: string): Promise<MeetingDoc[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "meetings"),
    orderBy("scheduledAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snap<MeetingDoc>(snapshot);
}

export async function getMeeting(workspaceId: string, meetingId: string): Promise<MeetingDoc | null> {
  const snap = await getDoc(doc(db, "workspaces", workspaceId, "meetings", meetingId));
  return snap.exists() ? (snap.data() as MeetingDoc) : null;
}

export async function createMeeting(
  workspaceId: string,
  data: Omit<MeetingDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(collection(db, "workspaces", workspaceId, "meetings"));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    taskCount: 0,
    decisionCount: 0,
    transcriptGenerated: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMeeting(workspaceId: string, meetingId: string, data: Partial<MeetingDoc>): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId, "meetings", meetingId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeMeetings(
  workspaceId: string,
  callback: (meetings: MeetingDoc[]) => void
) {
  const q = query(
    collection(db, "workspaces", workspaceId, "meetings"),
    orderBy("scheduledAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snap<MeetingDoc>(snapshot));
  });
}

export function subscribeMeeting(
  workspaceId: string,
  meetingId: string,
  callback: (meeting: MeetingDoc | null) => void
) {
  return onSnapshot(
    doc(db, "workspaces", workspaceId, "meetings", meetingId),
    (snap) => callback(snap.exists() ? (snap.data() as MeetingDoc) : null)
  );
}

// ─── TRANSCRIPT ───────────────────────────────────────────────────────────────

export async function getTranscript(workspaceId: string, meetingId: string): Promise<TranscriptLineDoc[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "meetings", meetingId, "transcript"),
    orderBy("timestampMs", "asc")
  );
  const snapshot = await getDocs(q);
  return snap<TranscriptLineDoc>(snapshot);
}

export async function addTranscriptLine(
  workspaceId: string,
  meetingId: string,
  line: Omit<TranscriptLineDoc, "id" | "createdAt">
): Promise<void> {
  const ref = doc(collection(db, "workspaces", workspaceId, "meetings", meetingId, "transcript"));
  await setDoc(ref, { ...line, id: ref.id, createdAt: serverTimestamp() });
}

export function subscribeTranscript(
  workspaceId: string,
  meetingId: string,
  callback: (lines: TranscriptLineDoc[]) => void
) {
  const q = query(
    collection(db, "workspaces", workspaceId, "meetings", meetingId, "transcript"),
    orderBy("timestampMs", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snap<TranscriptLineDoc>(snapshot));
  });
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

export async function getTasks(workspaceId: string): Promise<TaskDoc[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "tasks"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snap<TaskDoc>(snapshot);
}

export async function getTasksByMeeting(workspaceId: string, meetingId: string): Promise<TaskDoc[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "tasks"),
    where("meetingId", "==", meetingId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snap<TaskDoc>(snapshot);
}

export async function createTask(
  workspaceId: string,
  data: Omit<TaskDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(collection(db, "workspaces", workspaceId, "tasks"));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTask(workspaceId: string, taskId: string, data: Partial<TaskDoc>): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId, "tasks", taskId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(workspaceId: string, taskId: string): Promise<void> {
  await deleteDoc(doc(db, "workspaces", workspaceId, "tasks", taskId));
}

export function subscribeTasks(
  workspaceId: string,
  callback: (tasks: TaskDoc[]) => void
) {
  const q = query(
    collection(db, "workspaces", workspaceId, "tasks"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snap<TaskDoc>(snapshot));
  });
}

// ─── DECISIONS ────────────────────────────────────────────────────────────────

export async function getDecisions(workspaceId: string, meetingId: string): Promise<DecisionDoc[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "meetings", meetingId, "decisions"),
    orderBy("timestampMs", "asc")
  );
  const snapshot = await getDocs(q);
  return snap<DecisionDoc>(snapshot);
}

export async function addDecision(
  workspaceId: string,
  meetingId: string,
  decision: Omit<DecisionDoc, "id">
): Promise<void> {
  const ref = doc(collection(db, "workspaces", workspaceId, "meetings", meetingId, "decisions"));
  await setDoc(ref, { ...decision, id: ref.id });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function getNotifications(uid: string): Promise<NotificationDoc[]> {
  const q = query(
    collection(db, "users", uid, "notifications"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snap<NotificationDoc>(snapshot);
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "notifications", notificationId), { read: true });
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const q = query(
    collection(db, "users", uid, "notifications"),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

export async function deleteNotification(uid: string, notificationId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "notifications", notificationId));
}

export async function clearAllNotifications(uid: string): Promise<void> {
  const q = query(collection(db, "users", uid, "notifications"));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function createNotification(
  uid: string,
  data: Omit<NotificationDoc, "id" | "createdAt">
): Promise<void> {
  const ref = doc(collection(db, "users", uid, "notifications"));
  await setDoc(ref, { ...data, id: ref.id, read: false, createdAt: serverTimestamp() });
}

export function subscribeNotifications(
  uid: string,
  callback: (notifications: NotificationDoc[]) => void
) {
  const q = query(
    collection(db, "users", uid, "notifications"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snap<NotificationDoc>(snapshot));
  });
}