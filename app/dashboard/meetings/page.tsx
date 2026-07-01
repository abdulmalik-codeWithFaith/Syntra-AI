"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { MeetingDoc, MeetingStatus, MeetingPlatform } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "All" | MeetingStatus;

const FILTER_TABS: FilterTab[] = ["All", "Upcoming", "Live", "Processing", "Completed"];

const STATUS_STYLES: Record<MeetingStatus, { bg: string; color: string; dot: string }> = {
  Live:       { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
  Upcoming:   { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  Processing: { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
  Completed:  { bg: "#EDE9FE", color: "#6D28D9", dot: "#7C3AED" },
};

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#DB2777", "#059669", "#EA580C", "#0891B2"];
function colorFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Platform icon ────────────────────────────────────────────────────────────

function PlatformIcon({ platform }: { platform: MeetingPlatform }) {
  if (platform === "Google Meet") return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 11v6h6v-6z" /><path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" /><path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" /><path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  );
  if (platform === "Zoom") return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" /><circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" /><rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMeetingDate(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMeetingTime(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ search, onSearch, userName, userInitials }: {
  search: string; onSearch: (v: string) => void;
  userName: string; userInitials: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 rounded-2xl border border-gray-100 w-full" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative min-w-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" value={search} onChange={(e) => onSearch(e.target.value)}
          placeholder="Search meetings..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all" />
      </div>
      <div className="flex items-center gap-2 pl-2 border-l border-gray-200 flex-shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          {userInitials}
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Meeting row ──────────────────────────────────────────────────────────────

function MeetingRow({ meeting }: { meeting: MeetingDoc }) {
  const statusStyle = STATUS_STYLES[meeting.status];
  return (
    <a href={`/dashboard/meetings/${meeting.id}`}
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all duration-150 group w-full min-w-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB" }}>
        <PlatformIcon platform={meeting.platform} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
            {meeting.title}
          </p>
          {meeting.status === "Live" && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase flex-shrink-0" style={{ color: statusStyle.dot }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: statusStyle.dot }} />
              Live
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {meeting.platform} · {formatMeetingDate(meeting.scheduledAt)} at {formatMeetingTime(meeting.scheduledAt)}
          {meeting.durationMinutes ? ` · ${meeting.durationMinutes} min` : ""}
        </p>
      </div>

      {meeting.status === "Completed" && (
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{meeting.taskCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{meeting.decisionCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Decisions</p>
          </div>
        </div>
      )}

      <div className="hidden sm:flex -space-x-2 flex-shrink-0">
        {(meeting.attendees ?? []).slice(0, 3).map((a, i) => (
          <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white flex-shrink-0"
            style={{ background: a.color ?? colorFromEmail(a.email ?? a.name) }}>
            {a.initials ?? initialsFrom(a.name)}
          </div>
        ))}
        {(meeting.attendees ?? []).length > 3 && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 text-[10px] font-bold border-2 border-white bg-gray-100 flex-shrink-0">
            +{meeting.attendees.length - 3}
          </div>
        )}
      </div>

      <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:block"
        style={{ background: statusStyle.bg, color: statusStyle.color }}>
        {meeting.status}
      </span>

      {meeting.pdfUrl && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
          </svg>
        </div>
      )}

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </a>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">
        No {filter !== "All" ? filter.toLowerCase() : ""} meetings yet
      </p>
      <p className="text-xs text-gray-400 text-center px-4">
        Connect a calendar so Syntra can start joining meetings automatically.
      </p>
    </div>
  );
}

// ─── Schedule modal ───────────────────────────────────────────────────────────

function ScheduleModal({ onClose, workspaceId }: { onClose: () => void; workspaceId: string }) {
  const [form, setForm] = useState({ title: "", platform: "Google Meet" as MeetingPlatform, meetingLink: "", scheduledAt: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.title || !form.scheduledAt) return;
    setLoading(true);
    try {
      const ref = doc(collection(db, `workspaces/${workspaceId}/meetings`));
      await setDoc(ref, {
        id: ref.id,
        workspaceId,
        title: form.title,
        platform: form.platform,
        meetingLink: form.meetingLink,
        status: "Upcoming" as MeetingStatus,
        scheduledAt: Timestamp.fromDate(new Date(form.scheduledAt)),
        attendees: [],
        taskCount: 0,
        decisionCount: 0,
        transcriptGenerated: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error("Failed to schedule meeting:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(17,24,39,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Schedule meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Meeting title</label>
            <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Weekly Standup"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Platform</label>
            <select value={form.platform} onChange={(e) => setForm(p => ({ ...p, platform: e.target.value as MeetingPlatform }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400">
              <option>Google Meet</option>
              <option>Zoom</option>
              <option>Microsoft Teams</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Meeting link</label>
            <input type="url" value={form.meetingLink} onChange={(e) => setForm(p => ({ ...p, meetingLink: e.target.value }))}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Date & time</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <button onClick={handleSubmit} disabled={loading || !form.title || !form.scheduledAt}
            className="w-full text-white font-semibold text-sm rounded-xl py-3 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            {loading ? "Scheduling..." : "Schedule meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const { user, userDoc } = useAuth();
  const [meetings, setMeetings] = useState<MeetingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const workspaceId = userDoc?.currentWorkspaceId ?? "";
  const userName = user?.displayName ?? user?.email ?? "User";
  const userInitials = initialsFrom(userName);

  useEffect(() => {
    console.log("workspaceId:", workspaceId);
  console.log("userDoc:", userDoc);
    if (!workspaceId) return;
    const q = query(collection(db, `workspaces/${workspaceId}/meetings`),orderBy("scheduledAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
    console.log("meetings snap size:", snap.size);
    snap.docs.forEach(d => console.log("meeting doc:", d.id, d.data()));
    setMeetings(snap.docs.map((d) => d.data() as MeetingDoc));
    setLoading(false);
    
  });
    return () => unsub();
  }, [workspaceId]);

  const filtered = useMemo(() => {
    let result = meetings;
    if (activeFilter !== "All") result = result.filter((m) => m.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || m.platform.toLowerCase().includes(q));
    }
    return result;
  }, [meetings, activeFilter, search]);

  const counts: Record<FilterTab, number> = {
    All:        meetings.length,
    Upcoming:   meetings.filter((m) => m.status === "Upcoming").length,
    Live:       meetings.filter((m) => m.status === "Live").length,
    Processing: meetings.filter((m) => m.status === "Processing").length,
    Completed:  meetings.filter((m) => m.status === "Completed").length,
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .filter-scroll { scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="meetings" />

      <main className="flex-1 min-w-0 flex flex-col px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <Topbar search={search} onSearch={setSearch} userName={userName} userInitials={userInitials} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.25rem)", color: "#111827" }}>
              Meetings
            </h1>
            <p className="text-gray-500 text-sm mt-1">Every meeting Syntra has joined, is joining, or will join.</p>
          </div>
          <button onClick={() => setShowSchedule(true)}
            className="text-white text-sm font-semibold rounded-xl px-4 py-2.5 flex items-center gap-1.5 self-start sm:self-auto"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Schedule
          </button>
        </div>

        <div className="filter-scroll overflow-x-auto mb-6 -mx-1 px-1">
          <div className="flex items-center gap-1.5 w-max">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button key={tab} onClick={() => setActiveFilter(tab)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0"
                  style={{
                    background: isActive ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff",
                    color: isActive ? "#fff" : "#6B7280",
                    border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                  }}>
                  {tab}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6", color: isActive ? "#fff" : "#9CA3AF" }}>
                    {counts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5 pb-8">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)
          ) : filtered.length > 0 ? (
            filtered.map((m) => <MeetingRow key={m.id} meeting={m} />)
          ) : (
            <EmptyState filter={activeFilter} />
          )}
        </div>
        
      </main>

      {showSchedule && workspaceId && (
        <ScheduleModal onClose={() => setShowSchedule(false)} workspaceId={workspaceId} />
      )}
    </div>
  );
}