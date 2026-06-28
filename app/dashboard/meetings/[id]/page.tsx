"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { MeetingDoc, TaskDoc, DecisionDoc, TranscriptLineDoc, MeetingStatus, TaskStatus } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "summary" | "transcript" | "tasks" | "decisions";

const STATUS_STYLES: Record<TaskStatus, { bg: string; color: string }> = {
  Pending:       { bg: "#FEE2E2", color: "#B91C1C" },
  "In Progress": { bg: "#FEF3C7", color: "#B45309" },
  Complete:      { bg: "#EDE9FE", color: "#6D28D9" },
};

const MEETING_STATUS_STYLES: Record<MeetingStatus, { bg: string; color: string }> = {
  Live:       { bg: "#FEE2E2", color: "#B91C1C" },
  Upcoming:   { bg: "#EFF6FF", color: "#1D4ED8" },
  Processing: { bg: "#FEF3C7", color: "#B45309" },
  Completed:  { bg: "#EDE9FE", color: "#6D28D9" },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "summary",    label: "Summary" },
  { id: "transcript", label: "Transcript" },
  { id: "tasks",      label: "Tasks" },
  { id: "decisions",  label: "Decisions" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTs(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDeadline(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ userName, userInitials }: { userName: string; userInitials: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" placeholder="Search meetings, tasks, people..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all" />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          {userInitials}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Summary tab ──────────────────────────────────────────────────────────────

function SummaryTab({ meeting, taskCount, decisionCount }: {
  meeting: MeetingDoc; taskCount: number; decisionCount: number;
}) {
  const flaggedCount = meeting.transcriptGenerated ? 0 : 0; // placeholder

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">AI summary</h2>
        {meeting.summary ? (
          <p className="text-sm text-gray-600 leading-relaxed">{meeting.summary}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {meeting.status === "Upcoming" || meeting.status === "Live"
              ? "Summary will be generated after the meeting ends."
              : meeting.status === "Processing"
              ? "Syntra is generating the summary..."
              : "No summary available for this meeting."}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: taskCount, label: "Tasks extracted" },
          { value: decisionCount, label: "Decisions made" },
          { value: meeting.pdfUrl ? 1 : 0, label: "PDF generated" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
            <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {meeting.pdfUrl && (
        <a href={meeting.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 hover:bg-violet-100 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Download PDF report</p>
            <p className="text-xs text-gray-400">{meeting.pdfSizeKB ? `${meeting.pdfSizeKB} KB` : "Available"}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </a>
      )}
    </div>
  );
}

// ─── Transcript tab ────────────────────────────────────────────────────────────

function TranscriptTab({ meetingId, workspaceId, status }: {
  meetingId: string; workspaceId: string; status: MeetingStatus;
}) {
  const [lines, setLines] = useState<TranscriptLineDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId || !workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/meetings/${meetingId}/transcript`),
      orderBy("timestampMs", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setLines(snap.docs.map((d) => d.data() as TranscriptLineDoc));
      setLoading(false);
    });
    return () => unsub();
  }, [meetingId, workspaceId]);

  if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  if (lines.length === 0) return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
      <p className="text-sm font-medium text-gray-700 mb-1">No transcript yet</p>
      <p className="text-xs text-gray-400">
        {status === "Upcoming" ? "Transcript will appear during the meeting." :
         status === "Processing" ? "Transcript is being generated..." :
         "No transcript was recorded for this meeting."}
      </p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="space-y-5">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: line.isAgent ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#7C3AED" }}>
              {line.isAgent ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              ) : (
                initialsFrom(line.speaker)
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold" style={{ color: line.isAgent ? "#7C3AED" : "#111827" }}>{line.speaker}</p>
                <p className="text-xs text-gray-400">{Math.floor(line.timestampMs / 60000)}:{String(Math.floor((line.timestampMs % 60000) / 1000)).padStart(2, "0")}</p>
              </div>
              <p className="text-sm mt-0.5 leading-relaxed" style={{ color: line.isAgent ? "#5B21B6" : "#4B5563" }}>
                {line.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tasks tab ────────────────────────────────────────────────────────────────

function TasksTab({ meetingId, workspaceId }: { meetingId: string; workspaceId: string }) {
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/tasks`),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs
        .map((d) => d.data() as TaskDoc)
        .filter((t) => t.meetingId === meetingId)
      );
      setLoading(false);
    });
    return () => unsub();
  }, [meetingId, workspaceId]);

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    if (!workspaceId || !taskId) return;
    try {
      await updateDoc(doc(db, `workspaces/${workspaceId}/tasks`, taskId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  if (tasks.length === 0) return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
      <p className="text-sm font-medium text-gray-700 mb-1">No tasks extracted</p>
      <p className="text-xs text-gray-400">Tasks will appear here after the meeting is processed by Syntra.</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="divide-y divide-gray-50">
        {tasks.map((task) => {
          const statusStyle = STATUS_STYLES[task.status];
          return (
            <div key={task.id} className="flex items-center gap-4 px-6 py-4">
              <button
                onClick={() => handleStatusChange(task.id, task.status === "Complete" ? "Pending" : "Complete")}
                className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                style={{ borderColor: task.status === "Complete" ? "#7C3AED" : "#D1D5DB", background: task.status === "Complete" ? "#7C3AED" : "transparent" }}>
                {task.status === "Complete" && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900" style={{ textDecoration: task.status === "Complete" ? "line-through" : "none", color: task.status === "Complete" ? "#9CA3AF" : "#111827" }}>
                  {task.title}
                </p>
                {!task.ownerName && (
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#B45309" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    No owner assigned
                  </p>
                )}
              </div>
              {task.ownerName ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: task.ownerColor ?? "#7C3AED" }}>
                    {task.ownerInitials ?? initialsFrom(task.ownerName)}
                  </div>
                  <span className="text-xs text-gray-500 hidden sm:block">{task.ownerName}</span>
                </div>
              ) : (
                <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 flex-shrink-0">
                  + Assign
                </span>
              )}
              {task.deadline && (
                <span className="text-xs font-mono text-gray-400 flex-shrink-0 hidden sm:block">
                  {formatDeadline(task.deadline)}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {task.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Decisions tab ────────────────────────────────────────────────────────────

function DecisionsTab({ meetingId, workspaceId, status }: {
  meetingId: string; workspaceId: string; status: MeetingStatus;
}) {
  const [decisions, setDecisions] = useState<DecisionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId || !workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/meetings/${meetingId}/decisions`),
      orderBy("timestampMs", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setDecisions(snap.docs.map((d) => d.data() as DecisionDoc));
      setLoading(false);
    });
    return () => unsub();
  }, [meetingId, workspaceId]);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  if (decisions.length === 0) return (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
      <p className="text-sm font-medium text-gray-700 mb-1">No decisions recorded</p>
      <p className="text-xs text-gray-400">
        {status === "Upcoming" ? "Decisions will be logged during the meeting." :
         status === "Processing" ? "Processing decisions..." :
         "No decisions were logged for this meeting."}
      </p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="space-y-1">
        {decisions.map((d, i) => (
          <div key={d.id} className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              {i < decisions.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-sm text-gray-800 leading-relaxed">{d.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.floor(d.timestampMs / 60000)}:{String(Math.floor((d.timestampMs % 60000) / 1000)).padStart(2, "0")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MeetingDetailPage() {
  const { user, userDoc } = useAuth();
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<MeetingDoc | null>(null);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  const workspaceId = userDoc?.currentWorkspaceId ?? "";
  const userName = user?.displayName ?? user?.email ?? "User";
  const userInitials = initialsFrom(userName);

  // Load meeting doc
  useEffect(() => {
    if (!workspaceId || !meetingId) return;
    async function load() {
      const snap = await getDoc(doc(db, `workspaces/${workspaceId}/meetings`, meetingId));
      if (snap.exists()) setMeeting(snap.data() as MeetingDoc);
      setLoading(false);
    }
    load();
  }, [workspaceId, meetingId]);

  // Load tasks for count
  useEffect(() => {
    if (!workspaceId || !meetingId) return;
    const q = query(collection(db, `workspaces/${workspaceId}/tasks`), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => d.data() as TaskDoc).filter((t) => t.meetingId === meetingId));
    });
    return () => unsub();
  }, [workspaceId, meetingId]);

  if (loading) return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB" }}>
      <Sidebar activeId="meetings" />
      <main className="flex-1 px-6 sm:px-8 py-6">
        <div className="space-y-4 mt-16 animate-pulse">
          <div className="h-8 w-64 bg-gray-100 rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-2xl mt-8" />
        </div>
      </main>
    </div>
  );

  if (!meeting) return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB" }}>
      <Sidebar activeId="meetings" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Meeting not found</p>
          <a href="/dashboard/meetings" className="text-sm text-violet-600 hover:underline">← Back to meetings</a>
        </div>
      </main>
    </div>
  );

  const statusStyle = MEETING_STATUS_STYLES[meeting.status];

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="meetings" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1400px]">
        <Topbar userName={userName} userInitials={userInitials} />

        <a href="/dashboard/meetings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-6 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All meetings
        </a>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#111827" }}>
                {meeting.title}
              </h1>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {meeting.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {meeting.platform} · {formatDate(meeting.scheduledAt)}
              {meeting.scheduledAt && ` · ${formatTs(meeting.scheduledAt)}`}
              {meeting.durationMinutes ? ` · ${meeting.durationMinutes} min` : ""}
            </p>
            {(meeting.attendees ?? []).length > 0 && (
              <div className="flex items-center -space-x-2 mt-3">
                {meeting.attendees.map((a, i) => (
                  <div key={i} title={a.name}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                    style={{ background: a.color }}>
                    {a.initials}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {meeting.meetingLink && (
              <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold rounded-xl px-5 py-2.5 text-white flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 10l5-5m0 0h-5m5 0v5" /><path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6" />
                </svg>
                Join meeting
              </a>
            )}
            {meeting.pdfUrl && (
              <a href={meeting.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-2"
                style={{ border: "1.5px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                </svg>
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 mb-6 border-b border-gray-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-sm font-medium relative transition-colors"
                style={{ color: isActive ? "#7C3AED" : "#9CA3AF" }}>
                {tab.label}
                {tab.id === "tasks" && tasks.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                    {tasks.length}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #2563EB, #7C3AED)" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="pb-10">
          {activeTab === "summary" && (
            <SummaryTab meeting={meeting} taskCount={tasks.length} decisionCount={meeting.decisionCount} />
          )}
          {activeTab === "transcript" && (
            <TranscriptTab meetingId={meetingId} workspaceId={workspaceId} status={meeting.status} />
          )}
          {activeTab === "tasks" && (
            <TasksTab meetingId={meetingId} workspaceId={workspaceId} />
          )}
          {activeTab === "decisions" && (
            <DecisionsTab meetingId={meetingId} workspaceId={workspaceId} status={meeting.status} />
          )}
        </div>
      </main>
    </div>
  );
}