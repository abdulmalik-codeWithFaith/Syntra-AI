"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

type MeetingStatus = "Upcoming" | "Live" | "Processing" | "Completed";
type PlatformType = "Google Meet" | "Zoom" | "Microsoft Teams";

interface Meeting {
  id: string;
  title: string;
  platform: PlatformType;
  date: string;
  time: string;
  duration: string;
  status: MeetingStatus;
  attendees: { initials: string; color: string }[];
  taskCount: number;
  decisionCount: number;
  hasPDF: boolean;
}

type FilterTab = "All" | MeetingStatus;

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-6" />
    </svg>
  ),
  meetings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  integration: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" /><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
    </svg>
  ),
  agent: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a3 3 0 116 0v2" />
      <circle cx="9.5" cy="13.5" r="1" fill="currentColor" /><circle cx="14.5" cy="13.5" r="1" fill="currentColor" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  notification: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  collapseLeft: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9.5" y1="4" x2="9.5" y2="20" /><path d="M7 9l-2.5 3L7 15" />
    </svg>
  ),
  collapseRight: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9.5" y1="4" x2="9.5" y2="20" /><path d="M6.5 9l2.5 3-2.5 3" />
    </svg>
  ),
};

const PLATFORM_ICON: Record<PlatformType, React.ReactNode> = {
  "Google Meet": (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 11v6h6v-6z" /><path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" /><path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" /><path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  ),
  Zoom: (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  ),
  "Microsoft Teams": (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" /><circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" /><rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  ),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Icon.dashboard },
  { id: "overview", label: "Overview", href: "/dashboard/overview", icon: Icon.overview },
  { id: "meetings", label: "Meetings", href: "/dashboard/meetings", icon: Icon.meetings },
  { id: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: Icon.tasks },
  { id: "reports", label: "Reports", href: "/dashboard/reports", icon: Icon.reports },
  { id: "chat", label: "Chat", href: "/dashboard/chat", icon: Icon.chat },
  { id: "team", label: "Team", href: "/dashboard/team", icon: Icon.team },
  { id: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: Icon.integration },
  { id: "agent", label: "Agent", href: "/dashboard/agent", icon: Icon.agent },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Icon.settings },
];

const MEETINGS: Meeting[] = [
  {
    id: "1", title: "Q3 Planning", platform: "Google Meet", date: "Today", time: "10:00 AM", duration: "—",
    status: "Live", attendees: [{ initials: "J", color: "#2563EB" }, { initials: "S", color: "#DB2777" }, { initials: "M", color: "#059669" }],
    taskCount: 0, decisionCount: 0, hasPDF: false,
  },
  {
    id: "2", title: "Weekly Standup", platform: "Zoom", date: "Today", time: "2:00 PM", duration: "—",
    status: "Upcoming", attendees: [{ initials: "A", color: "#7C3AED" }, { initials: "E", color: "#2563EB" }],
    taskCount: 0, decisionCount: 0, hasPDF: false,
  },
  {
    id: "3", title: "Client Onboarding Call", platform: "Google Meet", date: "Yesterday", time: "4:30 PM", duration: "42 min",
    status: "Processing", attendees: [{ initials: "M", color: "#059669" }, { initials: "D", color: "#EA580C" }],
    taskCount: 0, decisionCount: 0, hasPDF: false,
  },
  {
    id: "4", title: "Product Sync — Mobile App", platform: "Zoom", date: "Yesterday", time: "11:00 AM", duration: "38 min",
    status: "Completed", attendees: [{ initials: "J", color: "#2563EB" }, { initials: "S", color: "#DB2777" }, { initials: "I", color: "#0891B2" }],
    taskCount: 5, decisionCount: 2, hasPDF: true,
  },
  {
    id: "5", title: "Marketing Strategy Review", platform: "Microsoft Teams", date: "Jun 18", time: "3:00 PM", duration: "55 min",
    status: "Completed", attendees: [{ initials: "A", color: "#7C3AED" }, { initials: "D", color: "#EA580C" }],
    taskCount: 3, decisionCount: 1, hasPDF: true,
  },
  {
    id: "6", title: "Engineering Retro", platform: "Google Meet", date: "Jun 17", time: "9:30 AM", duration: "31 min",
    status: "Completed", attendees: [{ initials: "E", color: "#2563EB" }, { initials: "M", color: "#059669" }, { initials: "J", color: "#2563EB" }, { initials: "I", color: "#0891B2" }],
    taskCount: 6, decisionCount: 3, hasPDF: true,
  },
  {
    id: "7", title: "Investor Update", platform: "Zoom", date: "Jun 15", time: "1:00 PM", duration: "24 min",
    status: "Completed", attendees: [{ initials: "A", color: "#7C3AED" }],
    taskCount: 2, decisionCount: 4, hasPDF: true,
  },
];

const FILTER_TABS: FilterTab[] = ["All", "Upcoming", "Live", "Processing", "Completed"];

const STATUS_STYLES: Record<MeetingStatus, { bg: string; color: string; dot: string }> = {
  Live: { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
  Upcoming: { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  Processing: { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
  Completed: { bg: "#EDE9FE", color: "#6D28D9", dot: "#7C3AED" },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const active = "meetings";
  return (
    <aside
      className="h-screen sticky top-0 flex flex-col border-r border-gray-100 bg-white transition-all duration-300"
      style={{ width: collapsed ? "76px" : "248px" }}
    >
      <div className={`flex items-center gap-2.5 px-5 pt-6 pb-7 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#111827", letterSpacing: "0.02em" }}>SYNTRA</p>
            <p className="text-[9px] tracking-[0.18em] uppercase" style={{ color: "#9CA3AF" }}>AI Sync &amp; Strategy</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "transparent",
                color: isActive ? "#fff" : "#6B7280",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </a>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-gray-100 space-y-0.5">
        <a
          href="/dashboard/notifications"
          title={collapsed ? "Notifications" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <span className="flex-shrink-0 relative">
            {Icon.notification}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </span>
          {!collapsed && <span>Notifications</span>}
        </a>
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <span className="flex-shrink-0">{collapsed ? Icon.collapseRight : Icon.collapseLeft}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search meetings, tasks, people..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
        />
      </div>
      <div className="flex-1" />
      <button title="Ask Syntra" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
      <button title="Record meeting" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" />
        </svg>
      </button>
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
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

// ─── Meeting row ────────────────────────────────────────────────────────────────

function MeetingRow({ meeting }: { meeting: Meeting }) {
  const statusStyle = STATUS_STYLES[meeting.status];
  return (
    <a
      href={`/dashboard/meetings/${meeting.id}`}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all duration-150 group"
    >
      {/* Platform icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB" }}>
        {PLATFORM_ICON[meeting.platform]}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">{meeting.title}</p>
          {meeting.status === "Live" && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase" style={{ color: statusStyle.dot }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusStyle.dot }} />
              Live
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {meeting.platform} · {meeting.date} at {meeting.time}
          {meeting.duration !== "—" && ` · ${meeting.duration}`}
        </p>
      </div>

      {/* Extracted info (only when completed) */}
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

      {/* Attendees */}
      <div className="hidden sm:flex -space-x-2 flex-shrink-0">
        {meeting.attendees.slice(0, 3).map((a, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
            style={{ background: a.color }}
          >
            {a.initials}
          </div>
        ))}
        {meeting.attendees.length > 3 && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 text-[10px] font-bold border-2 border-white bg-gray-100">
            +{meeting.attendees.length - 3}
          </div>
        )}
      </div>

      {/* Status badge */}
      <span
        className="text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 hidden sm:block"
        style={{ background: statusStyle.bg, color: statusStyle.color }}
      >
        {meeting.status}
      </span>

      {/* PDF indicator */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ opacity: meeting.hasPDF ? 1 : 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
        </svg>
      </div>

      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </a>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">No {filter !== "All" ? filter.toLowerCase() : ""} meetings</p>
      <p className="text-xs text-gray-400">Connect a calendar so Syntra can start joining meetings automatically.</p>
    </div>
  );
}

// ─── Main Meetings Page ───────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const filteredMeetings = activeFilter === "All" ? MEETINGS : MEETINGS.filter((m) => m.status === activeFilter);

  const counts: Record<FilterTab, number> = {
    All: MEETINGS.length,
    Upcoming: MEETINGS.filter((m) => m.status === "Upcoming").length,
    Live: MEETINGS.filter((m) => m.status === "Live").length,
    Processing: MEETINGS.filter((m) => m.status === "Processing").length,
    Completed: MEETINGS.filter((m) => m.status === "Completed").length,
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-outline-violet { border: 1.5px solid rgba(124, 58, 237, 0.3); color: #7C3AED; transition: all 0.15s ease; }
        .btn-outline-violet:hover { background: rgba(124, 58, 237, 0.06); border-color: #7C3AED; }
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Meetings
            </h1>
            <p className="text-gray-500 text-sm mt-1">Every meeting Syntra has joined, is joining, or will join.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline-violet text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" /><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
              </svg>
              Paste meeting link
            </button>
            <button className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Schedule meeting
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
                  color: isActive ? "#fff" : "#6B7280",
                  border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                }}
              >
                {tab}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                    color: isActive ? "#fff" : "#9CA3AF",
                  }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Meetings list */}
        <div className="space-y-2.5 pb-8">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((m) => <MeetingRow key={m.id} meeting={m} />)
          ) : (
            <EmptyState filter={activeFilter} />
          )}
        </div>
      </main>
    </div>
  );
}