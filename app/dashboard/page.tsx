"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { TaskDoc, MeetingDoc, MemberDoc } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  trend: string;
  href: string;
  highlighted: boolean;
}

interface CalendarMeeting {
  id: string;
  title: string;
  start: string;
  end: string;
  meetLink: string | null;
  platform: string;
  attendees: { email: string; name: string; self: boolean }[];
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Complete:      { bg: "#EDE9FE", color: "#6D28D9" },
  "In Progress": { bg: "#FEF3C7", color: "#B45309" },
  Pending:       { bg: "#FEE2E2", color: "#B91C1C" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#DB2777", "#059669", "#EA580C", "#0891B2"];
function colorFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(); tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ userName, userInitials }: { userName: string; userInitials: string }) {
  return (
    <div className="md:flex hidden items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100" style={{ background: "#F9FAFB" }}>
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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCardView({ card }: { card: StatCard }) {
  return (
    <a href={card.href}
      className="rounded-2xl p-6 flex flex-col justify-between border transition-all duration-200 hover:shadow-md group min-h-[152px]"
      style={{
        background: card.highlighted ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
        borderColor: card.highlighted ? "transparent" : "#F3F4F6",
      }}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium" style={{ color: card.highlighted ? "rgba(255,255,255,0.85)" : "#6B7280" }}>
          {card.label}
        </span>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ background: card.highlighted ? "rgba(255,255,255,0.15)" : "#F9FAFB", color: card.highlighted ? "#fff" : "#6B7280" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </span>
      </div>
      <div>
        <p className="font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.25rem", lineHeight: 1, color: card.highlighted ? "#fff" : "#111827" }}>
          {card.value}
        </p>
        <p className="text-xs" style={{ color: card.highlighted ? "rgba(255,255,255,0.7)" : "#9CA3AF" }}>
          {card.trend}
        </p>
      </div>
    </a>
  );
}

// ─── Upcoming meetings from Google Calendar ───────────────────────────────────

function UpcomingMeetingsCard({ uid }: { uid: string }) {
  const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/integrations/google/meetings?uid=${uid}`);
        if (res.ok) {
          const data = await res.json();
          setMeetings((data.meetings ?? []).slice(0, 4));
          setConnected(true);
        }
      } catch {
        // not connected
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Upcoming meetings</h2>
        {connected && (
          <a href="/dashboard/integrations" className="text-xs font-medium" style={{ color: "#7C3AED" }}>View all →</a>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : !connected ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#F5F3FF" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No calendar connected</p>
          <p className="text-xs text-gray-400 mb-3">Connect Google Calendar to see upcoming meetings.</p>
          <a href="/dashboard/integrations"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            Connect calendar
          </a>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No upcoming meetings in the next 30 days.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 transition-all">
              <div className="flex-shrink-0 w-10 text-center">
                <p className="text-[10px] font-semibold uppercase text-gray-400">{formatDate(m.start)}</p>
                <p className="text-xs font-semibold text-gray-700">{formatTime(m.start)}</p>
              </div>
              <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{m.title}</p>
                <p className="text-xs text-gray-400">{formatTime(m.start)} — {formatTime(m.end)}</p>
              </div>
              {m.meetLink && (
                <a href={m.meetLink} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                  Join
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Team collaboration ────────────────────────────────────────────────────────

function TeamCollaborationCard({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<(MemberDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/members`),
      where("status", "==", "Active"),
      limit(6)
    );
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as MemberDoc) })));
      setLoading(false);
    });
    return () => unsub();
  }, [workspaceId]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Team collaboration</h2>
        <button onClick={() => router.push("/dashboard/team")}
          className="text-sm font-medium rounded-lg px-4 py-2 bg-white flex items-center gap-1.5"
          style={{ border: "1.5px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add members
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No team members yet.</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3.5 py-3 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: colorFromEmail(m.email) }}>
                {initialsFrom(m.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.fullName}</p>
                  {m.role === "Owner" && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FCE7F3", color: "#9D174D" }}>
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{m.email}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: "#F3F4F6", color: "#4B5563" }}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recent tasks ─────────────────────────────────────────────────────────────

function RecentTasksCard({ workspaceId }: { workspaceId: string }) {
  const [tasks, setTasks] = useState<(TaskDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/tasks`),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TaskDoc) })));
      setLoading(false);
    });
    return () => unsub();
  }, [workspaceId]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Recent tasks</h2>
        <a href="/dashboard/tasks" className="text-xs font-medium" style={{ color: "#7C3AED" }}>View all →</a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No tasks yet. They'll appear here after meetings.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {tasks.map((t) => {
            const style = STATUS_STYLES[t.status] ?? STATUS_STYLES["Pending"];
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                  {t.ownerName && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {t.ownerName} · {t.meetingTitle}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: style.bg, color: style.color }}>
                  {t.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, userDoc } = useAuth();
  const [stats, setStats] = useState({ meetings: 0, completed: 0, inProgress: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const workspaceId = userDoc?.currentWorkspaceId ?? "";
  const userName = user?.displayName ?? user?.email ?? "User";
  const userInitials = initialsFrom(userName);

  // Load task stats
  useEffect(() => {
    if (!workspaceId) return;

    async function loadStats() {
      try {
        const [completedSnap, inProgressSnap, pendingSnap, meetingsSnap] = await Promise.all([
          getDocs(query(collection(db, `workspaces/${workspaceId}/tasks`), where("status", "==", "Complete"))),
          getDocs(query(collection(db, `workspaces/${workspaceId}/tasks`), where("status", "==", "In Progress"))),
          getDocs(query(collection(db, `workspaces/${workspaceId}/tasks`), where("status", "==", "Pending"))),
          getDocs(collection(db, `workspaces/${workspaceId}/meetings`)),
        ]);
        setStats({
          meetings: meetingsSnap.size,
          completed: completedSnap.size,
          inProgress: inProgressSnap.size,
          pending: pendingSnap.size,
        });
      } catch {
        // silently fail
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [workspaceId]);

  const statCards: StatCard[] = [
    { label: "Meetings", value: statsLoading ? "—" : String(stats.meetings), trend: "Total meetings in workspace", href: "/dashboard/meetings", highlighted: true },
    { label: "Tasks completed", value: statsLoading ? "—" : String(stats.completed), trend: "Across all meetings", href: "/dashboard/tasks", highlighted: false },
    { label: "Tasks in progress", value: statsLoading ? "—" : String(stats.inProgress), trend: "Currently being worked on", href: "/dashboard/tasks", highlighted: false },
    { label: "Tasks pending", value: statsLoading ? "—" : String(stats.pending), trend: "Waiting to be started", href: "/dashboard/tasks", highlighted: false },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="dashboard" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar userName={userName} userInitials={userInitials} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-7">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {userName.split(" ")[0]}. Here&apos;s what&apos;s happening.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard/integrations"
              className="text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-1.5"
              style={{ border: "1.5px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}>
              Connect calendar
            </a>
            <a href="/dashboard/meetings"
              className="text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New meeting
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {statCards.map((card) => (
            <StatCardView key={card.label} card={card} />
          ))}
        </div>

        {/* Upcoming meetings + team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {user && <UpcomingMeetingsCard uid={user.uid} />}
          <TeamCollaborationCard workspaceId={workspaceId} />
        </div>

        {/* Recent tasks */}
        <div className="pb-8">
          <RecentTasksCard workspaceId={workspaceId} />
        </div>
      </main>
    </div>
  );
}