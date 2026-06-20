"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  href: string;
  highlighted: boolean;
}

interface TeamMember {
  name: string;
  avatarColor: string;
  initials: string;
  role: "Owner" | null;
  task: string;
  status: "Complete" | "In Progress" | "Pending";
}

interface ActivityItem {
  actor: string;
  action: string;
  time: string;
}

// ─── Icons (inline, no external icon lib needed) ─────────────────────────────

const Icon = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  // overview: (
  //   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //     <path d="M3 3v18h18" />
  //     <path d="M7 14l4-4 4 4 5-6" />
  //   </svg>
  // ),
  meetings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="14" height="12" rx="2" />
      <path d="M17 9.5l4-2.5v9l-4-2.5" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  integration: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
    </svg>
  ),
  agent: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M9 8V6a3 3 0 116 0v2" />
      <circle cx="9.5" cy="13.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="13.5" r="1" fill="currentColor" />
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
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  collapseLeft: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
      <path d="M7 9l-2.5 3L7 15" />
    </svg>
  ),
  collapseRight: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
      <path d="M6.5 9l2.5 3-2.5 3" />
    </svg>
  ),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Icon.dashboard },
  // { id: "overview", label: "Overview", href: "/dashboard/overview", icon: Icon.overview },
  { id: "meetings", label: "Meetings", href: "/dashboard/meetings", icon: Icon.meetings },
  { id: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: Icon.tasks },
  { id: "reports", label: "Reports", href: "/dashboard/reports", icon: Icon.reports },
  { id: "chat", label: "Chat", href: "/dashboard/chat", icon: Icon.chat },
  { id: "team", label: "Team", href: "/dashboard/team", icon: Icon.team },
  { id: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: Icon.integration },
  { id: "agent", label: "Agent", href: "/dashboard/agent", icon: Icon.agent },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Icon.settings },
];

const STAT_CARDS: StatCard[] = [
  { label: "Meetings", value: "25", trend: "+9 from last month", trendUp: true, href: "/dashboard/meetings", highlighted: true },
  { label: "Tasks completed", value: "10", trend: "+9 from last month", trendUp: true, href: "/dashboard/tasks", highlighted: false },
  { label: "Tasks in progress", value: "02", trend: "+5 from last month", trendUp: true, href: "/dashboard/tasks", highlighted: false },
  { label: "Tasks pending", value: "01", trend: "+5 from last month", trendUp: true, href: "/dashboard/tasks", highlighted: false },
];

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Alexandra Deff", avatarColor: "#7C3AED", initials: "AD", role: "Owner", task: "Finished reviewing the Q3 meeting summary", status: "Complete" },
  { name: "Edwin Adeleke", avatarColor: "#2563EB", initials: "EA", role: null, task: "Working on tagging owners for open tasks", status: "In Progress" },
  { name: "Isaac Oluwatemilorun", avatarColor: "#DB2777", initials: "IO", role: null, task: "Reviewing decisions from yesterday's standup", status: "Pending" },
  { name: "David Oshodi", avatarColor: "#059669", initials: "DO", role: null, task: "Following up on the marketing assets task", status: "In Progress" },
  { name: "Sarah Chen", avatarColor: "#EA580C", initials: "SC", role: null, task: "Preparing PDF report for client call", status: "In Progress" },
];

const ACTIVITIES: ActivityItem[] = [
  { actor: "Syntra", action: "generated a PDF report for Q3 Planning meeting", time: "2 min ago" },
  { actor: "Syntra", action: "extracted 4 new tasks from Product Sync", time: "18 min ago" },
  { actor: "Edwin Adeleke", action: "marked \"Update API docs\" as complete", time: "1h ago" },
  { actor: "Syntra", action: "flagged a task with no assigned owner", time: "2h ago" },
  { actor: "Alexandra Deff", action: "invited sarah@company.com to the workspace", time: "3h ago" },
  { actor: "Syntra", action: "joined \"Weekly Standup\" automatically", time: "5h ago" },
  { actor: "Syntra", action: "sent meeting reminder to 6 teammates", time: "Yesterday" },
];

const STATUS_STYLES: Record<TeamMember["status"], { bg: string; color: string }> = {
  Complete: { bg: "#EDE9FE", color: "#6D28D9" },
  "In Progress": { bg: "#FEF3C7", color: "#B45309" },
  Pending: { bg: "#FEE2E2", color: "#B91C1C" },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [active, setActive] = useState<string>("dashboard");

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col border-r border-gray-100 bg-white transition-all duration-300"
      style={{ width: collapsed ? "76px" : "248px" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-5 pt-6 pb-7 ${collapsed ? "justify-center px-0" : ""}`}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#111827", letterSpacing: "0.02em" }}>
              SYNTRA
            </p>
            <p className="text-[9px] tracking-[0.18em] uppercase" style={{ color: "#9CA3AF" }}>
              AI Sync &amp; Strategy
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                setActive(item.id);
              }}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "transparent",
                color: isActive ? "#fff" : "#6B7280",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom section */}
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
      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search meetings, tasks, people..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Quick actions */}
      <button
        title="Ask Syntra"
        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
      <button
        title="Record meeting"
        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="14" height="12" rx="2" />
          <path d="M16 10l5-3v10l-5-3" />
        </svg>
      </button>

      {/* Profile */}
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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCardView({ card }: { card: StatCard }) {
  return (
    <a
      href={card.href}
      className="rounded-2xl p-6 flex flex-col justify-between border transition-all duration-200 hover:shadow-md group min-h-[152px]"
      style={{
        background: card.highlighted ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
        borderColor: card.highlighted ? "transparent" : "#F3F4F6",
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="text-sm font-medium"
          style={{ color: card.highlighted ? "rgba(255,255,255,0.85)" : "#6B7280" }}
        >
          {card.label}
        </span>
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{
            background: card.highlighted ? "rgba(255,255,255,0.15)" : "#F9FAFB",
            color: card.highlighted ? "#fff" : "#6B7280",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </span>
      </div>

      <div>
        <p
          className="font-bold mb-2"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.25rem", lineHeight: 1, color: card.highlighted ? "#fff" : "#111827" }}
        >
          {card.value}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center justify-center text-[10px] font-bold rounded-full w-4 h-4"
            style={{
              background: card.highlighted ? "rgba(255,255,255,0.2)" : "#ECFDF5",
              color: card.highlighted ? "#fff" : "#059669",
            }}
          >
            ↑
          </span>
          <span className="text-xs" style={{ color: card.highlighted ? "rgba(255,255,255,0.7)" : "#9CA3AF" }}>
            {card.trend}
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Team collaboration ────────────────────────────────────────────────────────

function TeamCollaborationCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Team collaboration</h2>
        <button className="btn-outline-violet text-sm font-medium rounded-lg px-4 py-2 bg-white flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add members
        </button>
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
        {TEAM_MEMBERS.map((m) => {
          const statusStyle = STATUS_STYLES[m.status];
          return (
            <div key={m.name} className="flex items-center gap-3.5 py-3 border-b border-gray-50 last:border-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: m.avatarColor }}
              >
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                  {m.role && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FCE7F3", color: "#9D174D" }}>
                      {m.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{m.task}</p>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {m.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent activity ───────────────────────────────────────────────────────────

function RecentActivityCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Recent activity</h2>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: a.actor === "Syntra" ? "#EDE9FE" : "#EFF6FF" }}
            >
              {a.actor === "Syntra" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              ) : (
                <span className="text-[10px] font-bold" style={{ color: "#2563EB" }}>
                  {a.actor.split(" ").map((w) => w[0]).join("")}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-snug">
                <span className="font-semibold text-gray-900">{a.actor}</span> {a.action}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .btn-outline-violet {
          border: 1.5px solid rgba(124, 58, 237, 0.3);
          color: #7C3AED;
          transition: all 0.15s ease;
        }
        .btn-outline-violet:hover {
          background: rgba(124, 58, 237, 0.06);
          border-color: #7C3AED;
        }
        .btn-primary-violet {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          transition: all 0.2s ease;
        }
        .btn-primary-violet:hover {
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-7">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Syntra is overseeing your meetings — here&apos;s what&apos;s happening.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline-violet text-sm font-semibold rounded-xl px-5 py-2.5 bg-white">
              Import data
            </button>
            <button className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New meeting
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {STAT_CARDS.map((card) => (
            <StatCardView key={card.label} card={card} />
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 pb-8">
          <TeamCollaborationCard />
          <RecentActivityCard />
        </div>
      </main>
    </div>
  );
}