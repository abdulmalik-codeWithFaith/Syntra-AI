"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { TaskDoc, TaskStatus } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "All" | TaskStatus | "No owner";
type SortKey   = "deadline" | "recent" | "meeting";

const FILTER_TABS: FilterTab[] = ["All", "Pending", "In Progress", "Complete", "No owner"];

const STATUS_STYLES: Record<TaskStatus, { bg: string; color: string }> = {
  Pending:       { bg: "#FEE2E2", color: "#B91C1C" },
  "In Progress": { bg: "#FEF3C7", color: "#B45309" },
  Complete:      { bg: "#EDE9FE", color: "#6D28D9" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDeadline(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(ts: any, status: TaskStatus): boolean {
  if (!ts || status === "Complete") return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d < new Date();
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
          placeholder="Search tasks..."
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

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({ task, workspaceId, onStatusChange }: {
  task: TaskDoc & { id: string };
  workspaceId: string;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}) {
  const statusStyle = STATUS_STYLES[task.status];
  const [menuOpen, setMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const overdue = isOverdue(task.deadline, task.status);
  const deadlineLabel = formatDeadline(task.deadline);

  async function handleStatusChange(newStatus: TaskStatus) {
    setUpdating(true);
    await onStatusChange(task.id, newStatus);
    setUpdating(false);
    setMenuOpen(false);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all duration-150 w-full min-w-0">
      {/* Checkbox */}
      <button
        onClick={() => handleStatusChange(task.status === "Complete" ? "Pending" : "Complete")}
        disabled={updating}
        className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors disabled:opacity-50"
        style={{
          borderColor: task.status === "Complete" ? "#7C3AED" : "#D1D5DB",
          background:  task.status === "Complete" ? "#7C3AED" : "transparent",
        }}>
        {task.status === "Complete" && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Title + meeting */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate"
          style={{
            color: task.status === "Complete" ? "#9CA3AF" : "#111827",
            textDecoration: task.status === "Complete" ? "line-through" : "none",
          }}>
          {task.title}
        </p>
        <a href={`/dashboard/meetings/${task.meetingId}`}
          className="text-xs text-gray-400 hover:text-violet-600 transition-colors mt-0.5 inline-flex items-center gap-1 truncate max-w-full">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" />
          </svg>
          <span className="truncate">{task.meetingTitle}</span>
        </a>
      </div>

      {/* Owner */}
      <div className="flex-shrink-0 hidden md:block" style={{ width: "8rem" }}>
        {task.ownerName ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ background: task.ownerColor ?? "#7C3AED" }}>
              {task.ownerInitials ?? initialsFrom(task.ownerName)}
            </div>
            <span className="text-xs text-gray-500 truncate">{task.ownerName}</span>
          </div>
        ) : (
          <span className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 w-full text-center block">
            No owner
          </span>
        )}
      </div>

      {/* Deadline */}
      <div className="flex-shrink-0 w-16 hidden sm:block">
        {deadlineLabel ? (
          <span className="text-xs font-mono flex items-center gap-1" style={{ color: overdue ? "#DC2626" : "#9CA3AF" }}>
            {overdue && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            {deadlineLabel}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Status dropdown */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setMenuOpen((o) => !o)} disabled={updating}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
          style={{ background: statusStyle.bg, color: statusStyle.color }}>
          <span className="hidden sm:inline">{task.status}</span>
          <span className="sm:hidden">{task.status === "In Progress" ? "WIP" : task.status === "Complete" ? "Done" : task.status}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 w-36">
              {(["Pending", "In Progress", "Complete"] as TaskStatus[]).map((s) => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  style={{ color: STATUS_STYLES[s].color }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_STYLES[s].color }} />
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">No tasks found</p>
      <p className="text-xs text-gray-400 text-center px-4">Tasks will appear here automatically after your meetings.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { user, userDoc } = useAuth();
  const [tasks, setTasks]           = useState<(TaskDoc & { id: string })[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState<SortKey>("deadline");

  const workspaceId = userDoc?.currentWorkspaceId ?? "";
  const userName = user?.displayName ?? user?.email ?? "User";
  const userInitials = initialsFrom(userName);

  // ── Real-time tasks listener ───────────────────────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/tasks`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => { const data = d.data() as TaskDoc; return { ...data, id: d.id }; }));
      setLoading(false);
    });
    return () => unsub();
  }, [workspaceId]);

  // ── Update task status in Firestore ───────────────────────────────────────
  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    if (!workspaceId) return;
    try {
      await updateDoc(doc(db, `workspaces/${workspaceId}/tasks`, taskId), {
        status: newStatus,
        overdue: newStatus === "Complete" ? false : isOverdue(
          tasks.find(t => t.id === taskId)?.deadline, newStatus
        ),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (activeFilter === "No owner") {
      result = result.filter((t) => !t.ownerUid && !t.ownerName);
    } else if (activeFilter !== "All") {
      result = result.filter((t) => t.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.ownerName ?? "").toLowerCase().includes(q) ||
        t.meetingTitle.toLowerCase().includes(q)
      );
    }
    const sorted = [...result];
    if (sortKey === "deadline") {
      sorted.sort((a, b) => {
        const aDate = a.deadline?.toDate?.() ?? null;
        const bDate = b.deadline?.toDate?.() ?? null;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      });
    } else if (sortKey === "meeting") {
      sorted.sort((a, b) => a.meetingTitle.localeCompare(b.meetingTitle));
    }
    return sorted;
  }, [tasks, activeFilter, search, sortKey]);

  const counts: Record<FilterTab, number> = {
    All:           tasks.length,
    Pending:       tasks.filter((t) => t.status === "Pending").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Complete:      tasks.filter((t) => t.status === "Complete").length,
    "No owner":    tasks.filter((t) => !t.ownerUid && !t.ownerName).length,
  };

  const overdueCount = tasks.filter((t) => isOverdue(t.deadline, t.status)).length;

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); }
        .filter-scroll { scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="tasks" />

      <main className="flex-1 min-w-0 flex flex-col px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <Topbar search={search} onSearch={setSearch} userName={userName} userInitials={userInitials} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.25rem)", color: "#111827" }}>
              Tasks
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Every task Syntra has extracted across all your meetings.
              {overdueCount > 0 && (
                <span className="ml-2 font-medium" style={{ color: "#DC2626" }}>{overdueCount} overdue</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm font-medium rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-600 focus:outline-none focus:border-violet-300 cursor-pointer">
              <option value="deadline">Sort: Deadline</option>
              <option value="meeting">Sort: Meeting</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-scroll overflow-x-auto mb-6 -mx-1 px-1">
          <div className="flex items-center gap-1.5 w-max">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button key={tab} onClick={() => setActiveFilter(tab)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0"
                  style={{
                    background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                    color:      isActive ? "#fff" : "#6B7280",
                    border:     isActive ? "1px solid transparent" : "1px solid #E5E7EB",
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

        {/* Task list */}
        <div className="space-y-2.5 pb-8">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((t) => (
              <TaskRow key={t.id} task={t} workspaceId={workspaceId} onStatusChange={handleStatusChange} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}