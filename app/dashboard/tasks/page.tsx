"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "Pending" | "In Progress" | "Complete";
type FilterTab  = "All" | TaskStatus | "No owner";
type SortKey    = "deadline" | "recent" | "meeting";

interface Owner {
  name:     string;
  initials: string;
  color:    string;
}

interface Task {
  id:            string;
  title:         string;
  owner:         Owner | null;
  deadline:      string | null;
  deadlineDate:  string; // ISO for sorting, empty if none
  status:        TaskStatus;
  meetingTitle:  string;
  meetingId:     string;
  overdue:       boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OWNERS: Record<string, Owner> = {
  john:      { name: "John Carter",            initials: "J", color: "#2563EB" },
  sarah:     { name: "Sarah Kim",              initials: "S", color: "#DB2777" },
  isaac:     { name: "Isaac Oluwatemilorun",   initials: "I", color: "#0891B2" },
  alexandra: { name: "Alexandra Deff",         initials: "A", color: "#7C3AED" },
  david:     { name: "David Oshodi",           initials: "D", color: "#059669" },
};

const INITIAL_TASKS: Task[] = [
  { id: "t1",  title: "Finalize onboarding flow spacing adjustments",      owner: OWNERS.sarah,     deadline: "Jun 22", deadlineDate: "2026-06-22", status: "In Progress", meetingTitle: "Product Sync — Mobile App",    meetingId: "4", overdue: false },
  { id: "t2",  title: "Run performance audit on dashboard API endpoint",   owner: OWNERS.john,      deadline: "Jun 25", deadlineDate: "2026-06-25", status: "Pending",     meetingTitle: "Product Sync — Mobile App",    meetingId: "4", overdue: false },
  { id: "t3",  title: "Send beta invites to 50 confirmed testers",         owner: OWNERS.isaac,     deadline: "Jun 21", deadlineDate: "2026-06-21", status: "Pending",     meetingTitle: "Product Sync — Mobile App",    meetingId: "4", overdue: true  },
  { id: "t4",  title: "Update onboarding copy based on legal review",      owner: null,             deadline: null,     deadlineDate: "",           status: "Pending",     meetingTitle: "Product Sync — Mobile App",    meetingId: "4", overdue: false },
  { id: "t5",  title: "Prepare release notes draft",                       owner: OWNERS.sarah,     deadline: "Aug 10", deadlineDate: "2026-08-10", status: "Pending",     meetingTitle: "Product Sync — Mobile App",    meetingId: "4", overdue: false },
  { id: "t6",  title: "Share Q3 budget breakdown with finance",            owner: OWNERS.alexandra, deadline: "Jun 20", deadlineDate: "2026-06-20", status: "In Progress", meetingTitle: "Marketing Strategy Review",    meetingId: "5", overdue: false },
  { id: "t7",  title: "Finalize ad creative for social campaign",          owner: OWNERS.david,     deadline: "Jun 19", deadlineDate: "2026-06-19", status: "Complete",    meetingTitle: "Marketing Strategy Review",    meetingId: "5", overdue: false },
  { id: "t8",  title: "Fix flaky CI pipeline on staging branch",           owner: OWNERS.john,      deadline: "Jun 18", deadlineDate: "2026-06-18", status: "Complete",    meetingTitle: "Engineering Retro",            meetingId: "6", overdue: false },
  { id: "t9",  title: "Document new auth middleware",                      owner: OWNERS.isaac,     deadline: "Jun 24", deadlineDate: "2026-06-24", status: "Pending",     meetingTitle: "Engineering Retro",            meetingId: "6", overdue: false },
  { id: "t10", title: "Schedule load testing before launch",               owner: null,             deadline: null,     deadlineDate: "",           status: "Pending",     meetingTitle: "Engineering Retro",            meetingId: "6", overdue: false },
  { id: "t11", title: "Refactor onboarding state management",              owner: OWNERS.sarah,     deadline: "Jun 17", deadlineDate: "2026-06-17", status: "Complete",    meetingTitle: "Engineering Retro",            meetingId: "6", overdue: false },
  { id: "t12", title: "Prepare investor deck v3 with updated metrics",     owner: OWNERS.alexandra, deadline: "Jun 23", deadlineDate: "2026-06-23", status: "In Progress", meetingTitle: "Investor Update",              meetingId: "7", overdue: false },
];

const FILTER_TABS: FilterTab[] = ["All", "Pending", "In Progress", "Complete", "No owner"];

const STATUS_STYLES: Record<TaskStatus, { bg: string; color: string }> = {
  Pending:      { bg: "#FEE2E2", color: "#B91C1C" },
  "In Progress":{ bg: "#FEF3C7", color: "#B45309" },
  Complete:     { bg: "#EDE9FE", color: "#6D28D9" },
};

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100"
      style={{ background: "#F9FAFB" }}
    >
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
        />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          MI
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Musa Imran</p>
          <p className="text-xs text-gray-400 leading-tight">Admin</p>
        </div>
      </div>
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const statusStyle = STATUS_STYLES[task.status];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all duration-150 group">
      {/* Checkbox */}
      <button
        onClick={() => onStatusChange(task.id, task.status === "Complete" ? "Pending" : "Complete")}
        className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors"
        style={{
          borderColor: task.status === "Complete" ? "#7C3AED" : "#D1D5DB",
          background:  task.status === "Complete" ? "#7C3AED" : "transparent",
        }}
      >
        {task.status === "Complete" && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Title + meeting source */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color:          task.status === "Complete" ? "#9CA3AF" : "#111827",
            textDecoration: task.status === "Complete" ? "line-through" : "none",
          }}
        >
          {task.title}
        </p>
        <a
          href={`/dashboard/meetings/${task.meetingId}`}
          className="text-xs text-gray-400 hover:text-violet-600 transition-colors mt-0.5 inline-flex items-center gap-1"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" />
          </svg>
          {task.meetingTitle}
        </a>
      </div>

      {/* Owner */}
      {task.owner ? (
        <div className="flex items-center gap-2 flex-shrink-0 w-36">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: task.owner.color }}
          >
            {task.owner.initials}
          </div>
          <span className="text-xs text-gray-500 truncate hidden md:block">{task.owner.name}</span>
        </div>
      ) : (
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-violet-300 hover:text-violet-600 transition-colors flex-shrink-0 w-36 text-center">
          + Assign owner
        </button>
      )}

      {/* Deadline */}
      <div className="flex-shrink-0 w-20 hidden sm:block">
        {task.deadline ? (
          <span
            className="text-xs font-mono flex items-center gap-1"
            style={{ color: task.overdue ? "#DC2626" : "#9CA3AF" }}
          >
            {task.overdue && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            {task.deadline}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Status dropdown */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {task.status}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 w-36">
              {(["Pending", "In Progress", "Complete"] as TaskStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(task.id, s); setMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  style={{ color: STATUS_STYLES[s].color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLES[s].color }} />
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
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#F5F3FF" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">No tasks found</p>
      <p className="text-xs text-gray-400">Tasks will appear here automatically after your meetings.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search,       setSearch]       = useState<string>("");
  const [sortKey,      setSortKey]      = useState<SortKey>("deadline");
  const [tasks,        setTasks]        = useState<Task[]>(INITIAL_TASKS);

  function handleStatusChange(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (activeFilter === "No owner") {
      result = result.filter((t) => !t.owner);
    } else if (activeFilter !== "All") {
      result = result.filter((t) => t.status === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.owner?.name.toLowerCase().includes(q) ||
          t.meetingTitle.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    if (sortKey === "deadline") {
      sorted.sort((a, b) => {
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return a.deadlineDate.localeCompare(b.deadlineDate);
      });
    } else if (sortKey === "meeting") {
      sorted.sort((a, b) => a.meetingTitle.localeCompare(b.meetingTitle));
    }
    // "recent" keeps insertion order

    return sorted;
  }, [tasks, activeFilter, search, sortKey]);

  const counts: Record<FilterTab, number> = {
    All:          tasks.length,
    Pending:      tasks.filter((t) => t.status === "Pending").length,
    "In Progress":tasks.filter((t) => t.status === "In Progress").length,
    Complete:     tasks.filter((t) => t.status === "Complete").length,
    "No owner":   tasks.filter((t) => !t.owner).length,
  };

  const overdueCount = tasks.filter((t) => t.overdue && t.status !== "Complete").length;

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* ── Sidebar ── */}
      <Sidebar activeId="tasks" />

      {/* ── Main content ── */}
      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar search={search} onSearch={setSearch} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1
              style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}
            >
              Tasks
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Every task Syntra has extracted across all your meetings.
              {overdueCount > 0 && (
                <span className="ml-2 font-medium" style={{ color: "#DC2626" }}>
                  {overdueCount} overdue
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm font-medium rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:outline-none focus:border-violet-300 cursor-pointer"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="meeting">Sort: Meeting</option>
              <option value="recent">Sort: Recently added</option>
            </select>
            <button className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New task
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                  color:      isActive ? "#fff" : "#6B7280",
                  border:     isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                }}
              >
                {tab}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                    color:      isActive ? "#fff" : "#9CA3AF",
                  }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Task list */}
        <div className="space-y-2.5 pb-8">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((t) => (
              <TaskRow key={t.id} task={t} onStatusChange={handleStatusChange} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}