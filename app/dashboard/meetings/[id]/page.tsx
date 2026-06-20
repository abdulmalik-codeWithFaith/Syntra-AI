"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

type TaskStatus = "Pending" | "In Progress" | "Complete";
type TabId = "summary" | "transcript" | "tasks" | "decisions";

interface ExtractedTask {
  id: string;
  title: string;
  owner: { name: string; initials: string; color: string } | null;
  deadline: string | null;
  status: TaskStatus;
}

interface Decision {
  id: string;
  text: string;
  timestamp: string;
}

interface TranscriptLine {
  id: string;
  speaker: string;
  initials: string;
  color: string;
  text: string;
  timestamp: string;
  isAgent?: boolean;
}

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

const MEETING = {
  title: "Product Sync — Mobile App",
  platform: "Zoom" as const,
  date: "June 19, 2026",
  time: "11:00 AM – 11:38 AM",
  duration: "38 min",
  status: "Completed" as const,
  attendees: [
    { name: "John Carter", initials: "J", color: "#2563EB" },
    { name: "Sarah Kim", initials: "S", color: "#DB2777" },
    { name: "Isaac Oluwatemilorun", initials: "I", color: "#0891B2" },
  ],
};

const SUMMARY_TEXT = `The team reviewed progress on the mobile app redesign. Sarah presented updated wireframes for the onboarding flow, which the group approved with minor spacing adjustments. John raised concerns about the current API response time on the dashboard endpoint, and the team agreed to prioritize a performance audit before the next release. Isaac confirmed the beta testing group is finalized at 50 users, with invites going out this week. The meeting closed with alignment on shipping the redesign by August 15th, contingent on the performance audit results.`;

const TASKS: ExtractedTask[] = [
  { id: "t1", title: "Finalize onboarding flow spacing adjustments", owner: { name: "Sarah Kim", initials: "S", color: "#DB2777" }, deadline: "Jun 22", status: "In Progress" },
  { id: "t2", title: "Run performance audit on dashboard API endpoint", owner: { name: "John Carter", initials: "J", color: "#2563EB" }, deadline: "Jun 25", status: "Pending" },
  { id: "t3", title: "Send beta invites to 50 confirmed testers", owner: { name: "Isaac Oluwatemilorun", initials: "I", color: "#0891B2" }, deadline: "Jun 21", status: "Pending" },
  { id: "t4", title: "Update onboarding copy based on legal review", owner: null, deadline: null, status: "Pending" },
  { id: "t5", title: "Prepare release notes draft", owner: { name: "Sarah Kim", initials: "S", color: "#DB2777" }, deadline: "Aug 10", status: "Pending" },
];

const DECISIONS: Decision[] = [
  { id: "d1", text: "Approved updated onboarding wireframes with minor spacing changes", timestamp: "11:08 AM" },
  { id: "d2", text: "Performance audit will be prioritized before next release", timestamp: "11:19 AM" },
  { id: "d3", text: "Beta testing group finalized at 50 users", timestamp: "11:27 AM" },
];

const TRANSCRIPT: TranscriptLine[] = [
  { id: "tr1", speaker: "Sarah Kim", initials: "S", color: "#DB2777", text: "I've updated the onboarding wireframes based on last week's feedback — let me share my screen.", timestamp: "11:02 AM" },
  { id: "tr2", speaker: "John Carter", initials: "J", color: "#2563EB", text: "These look great. I think the spacing on step 2 is a little tight though.", timestamp: "11:05 AM" },
  { id: "tr3", speaker: "Sarah Kim", initials: "S", color: "#DB2777", text: "Agreed, I'll adjust that. Can have it done by Monday.", timestamp: "11:07 AM" },
  { id: "tr4", speaker: "Syntra", initials: "AI", color: "#7C3AED", text: "Got it — logged as a task for Sarah, due Monday June 22nd.", timestamp: "11:08 AM", isAgent: true },
  { id: "tr5", speaker: "John Carter", initials: "J", color: "#2563EB", text: "Separately, I want to flag that the dashboard API has been slow this week — averaging almost 3 seconds on load.", timestamp: "11:15 AM" },
  { id: "tr6", speaker: "Isaac Oluwatemilorun", initials: "I", color: "#0891B2", text: "Yeah I've noticed that too during testing. We should look into it before we ship anything new.", timestamp: "11:17 AM" },
  { id: "tr7", speaker: "John Carter", initials: "J", color: "#2563EB", text: "I can take that — I'll run a full performance audit and report back by Thursday.", timestamp: "11:19 AM" },
  { id: "tr8", speaker: "Syntra", initials: "AI", color: "#7C3AED", text: "Noted as a decision: performance audit prioritized before next release. Task assigned to John, due Jun 25.", timestamp: "11:19 AM", isAgent: true },
  { id: "tr9", speaker: "Isaac Oluwatemilorun", initials: "I", color: "#0891B2", text: "On the beta side, I've confirmed all 50 testers. Just need to send the invites out.", timestamp: "11:26 AM" },
  { id: "tr10", speaker: "Syntra", initials: "AI", color: "#7C3AED", text: "Who's sending those invites, and by when?", timestamp: "11:26 AM", isAgent: true },
  { id: "tr11", speaker: "Isaac Oluwatemilorun", initials: "I", color: "#0891B2", text: "I'll handle it — going out this week, so by Friday.", timestamp: "11:27 AM" },
];

const STATUS_STYLES: Record<TaskStatus, { bg: string; color: string }> = {
  Pending: { bg: "#FEE2E2", color: "#B91C1C" },
  "In Progress": { bg: "#FEF3C7", color: "#B45309" },
  Complete: { bg: "#EDE9FE", color: "#6D28D9" },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "transcript", label: "Transcript" },
  { id: "tasks", label: "Tasks" },
  { id: "decisions", label: "Decisions" },
];

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

// ─── Tab content: Summary ──────────────────────────────────────────────────────

function SummaryTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">AI summary</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{SUMMARY_TEXT}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
          <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-bold text-gray-900">{TASKS.length}</p>
          <p className="text-xs text-gray-400 mt-1">Tasks extracted</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
          <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-bold text-gray-900">{DECISIONS.length}</p>
          <p className="text-xs text-gray-400 mt-1">Decisions made</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
          <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-bold text-gray-900">1</p>
          <p className="text-xs text-gray-400 mt-1">Flagged item</p>
        </div>
      </div>

      <div className="rounded-2xl border p-5 flex items-start gap-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Syntra flagged 1 task with no owner</p>
          <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>&quot;Update onboarding copy based on legal review&quot; — no one was assigned during the meeting.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab content: Transcript ────────────────────────────────────────────────────

function TranscriptTab() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="space-y-5">
        {TRANSCRIPT.map((line) => (
          <div key={line.id} className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: line.isAgent ? "linear-gradient(135deg, #2563EB, #7C3AED)" : line.color }}
            >
              {line.isAgent ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              ) : (
                line.initials
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold" style={{ color: line.isAgent ? "#7C3AED" : "#111827" }}>{line.speaker}</p>
                <p className="text-xs text-gray-400">{line.timestamp}</p>
              </div>
              <p
                className="text-sm mt-0.5 leading-relaxed"
                style={{ color: line.isAgent ? "#5B21B6" : "#4B5563" }}
              >
                {line.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab content: Tasks ─────────────────────────────────────────────────────────

function TasksTab() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="divide-y divide-gray-50">
        {TASKS.map((task) => {
          const statusStyle = STATUS_STYLES[task.status];
          return (
            <div key={task.id} className="flex items-center gap-4 px-6 py-4">
              <div
                className="w-5 h-5 rounded-md border-2 flex-shrink-0"
                style={{ borderColor: task.status === "Complete" ? "#7C3AED" : "#D1D5DB", background: task.status === "Complete" ? "#7C3AED" : "transparent" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                {!task.owner && (
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#B45309" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    No owner assigned
                  </p>
                )}
              </div>
              {task.owner ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: task.owner.color }}>
                    {task.owner.initials}
                  </div>
                  <span className="text-xs text-gray-500 hidden sm:block">{task.owner.name}</span>
                </div>
              ) : (
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-violet-300 hover:text-violet-600 transition-colors flex-shrink-0">
                  + Assign
                </button>
              )}
              {task.deadline && (
                <span className="text-xs font-mono text-gray-400 flex-shrink-0 hidden sm:block">{task.deadline}</span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {task.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab content: Decisions ──────────────────────────────────────────────────────

function DecisionsTab() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="space-y-1">
        {DECISIONS.map((d, i) => (
          <div key={d.id} className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              {i < DECISIONS.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-sm text-gray-800 leading-relaxed">{d.text}</p>
              <p className="text-xs text-gray-400 mt-1">{d.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Meeting Detail Page ───────────────────────────────────────────────────

export default function MeetingDetailPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>("summary");

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

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1400px]">
        <Topbar />

        {/* Back link */}
        <a href="/dashboard/meetings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-6 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All meetings
        </a>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#111827" }}>
                {MEETING.title}
              </h1>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#EDE9FE", color: "#6D28D9" }}>
                {MEETING.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {MEETING.platform} · {MEETING.date} · {MEETING.time} · {MEETING.duration}
            </p>
            <div className="flex items-center -space-x-2 mt-3">
              {MEETING.attendees.map((a) => (
                <div
                  key={a.name}
                  title={a.name}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  style={{ background: a.color }}
                >
                  {a.initials}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="btn-outline-violet text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
              </svg>
              Download PDF
            </button>
            <button className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Ask Syntra
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 mb-6 border-b border-gray-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-sm font-medium relative transition-colors"
                style={{ color: isActive ? "#7C3AED" : "#9CA3AF" }}
              >
                {tab.label}
                {tab.id === "tasks" && (
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                    {TASKS.length}
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
          {activeTab === "summary" && <SummaryTab />}
          {activeTab === "transcript" && <TranscriptTab />}
          {activeTab === "tasks" && <TasksTab />}
          {activeTab === "decisions" && <DecisionsTab />}
        </div>
      </main>
    </div>
  );
}