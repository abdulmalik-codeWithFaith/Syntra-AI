"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { WorkspaceDoc } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeId?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  meetings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" /></svg>,
  tasks:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
  reports:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>,
  chat:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
  team:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  integrations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" /><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" /></svg>,
  agent:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a3 3 0 116 0v2" /><circle cx="9.5" cy="13.5" r="1" fill="currentColor" /><circle cx="14.5" cy="13.5" r="1" fill="currentColor" /></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  notification: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  menu:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  // Collapse arrows
  panelLeft:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M16 15l-3-3 3-3" /></svg>,
  panelRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M13 9l3 3-3 3" /></svg>,
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",    label: "Dashboard",    href: "/dashboard",              icon: Icon.dashboard    },
  { id: "meetings",     label: "Meetings",     href: "/dashboard/meetings",     icon: Icon.meetings     },
  { id: "tasks",        label: "Tasks",        href: "/dashboard/tasks",        icon: Icon.tasks        },
  { id: "reports",      label: "Reports",      href: "/dashboard/reports",      icon: Icon.reports      },
  { id: "chat",         label: "Chat",         href: "/dashboard/chat",         icon: Icon.chat         },
  { id: "team",         label: "Team",         href: "/dashboard/team",         icon: Icon.team         },
  { id: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: Icon.integrations },
  { id: "agent",        label: "Agent",        href: "/dashboard/agent",        icon: Icon.agent        },
  { id: "settings",     label: "Settings",     href: "/dashboard/settings",     icon: Icon.settings     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const WS_COLORS = ["#7C3AED", "#2563EB", "#DB2777", "#059669", "#EA580C", "#0891B2"];
function wsColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return WS_COLORS[Math.abs(hash) % WS_COLORS.length];
}

// ─── Workspace switcher ───────────────────────────────────────────────────────

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { user, userDoc } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceDoc[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentWsId = userDoc?.currentWorkspaceId ?? "";

  useEffect(() => {
    if (!userDoc?.workspaceIds?.length) return;
    async function load() {
      const snaps = await Promise.all(
        userDoc!.workspaceIds.map((id) =>
          import("firebase/firestore").then(({ doc: fDoc, getDoc }) =>
            getDoc(fDoc(db, "workspaces", id))
          )
        )
      );
      setWorkspaces(snaps.filter((s) => s.exists()).map((s) => s.data() as WorkspaceDoc));
    }
    load();
  }, [userDoc?.workspaceIds?.join(",")]);

  const currentWs = workspaces.find((w) => w.id === currentWsId);

  async function switchWorkspace(wsId: string) {
    if (wsId === currentWsId || !user) return;
    setSwitching(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        currentWorkspaceId: wsId,
        updatedAt: serverTimestamp(),
      });
      setOpen(false);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to switch workspace:", err);
    } finally {
      setSwitching(false);
    }
  }

  if (!currentWs && !collapsed) return (
    <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-400">No workspace</p>
    </div>
  );

  if (collapsed) {
    return (
      <div className="flex justify-center mb-3 relative">
        <button onClick={() => setOpen((o) => !o)} title={currentWs?.workspaceName ?? "Workspace"}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-105"
          style={{ background: wsColor(currentWsId) }}>
          {initialsFrom(currentWs?.workspaceName ?? "W")}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-full ml-2 top-0 z-20 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 w-56">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-4 pb-1">Workspaces</p>
              {workspaces.map((ws) => (
                <button key={ws.id} onClick={() => switchWorkspace(ws.id)} disabled={switching}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background: wsColor(ws.id) }}>
                    {initialsFrom(ws.workspaceName)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">{ws.workspaceName}</p>
                    <p className="text-xs text-gray-400 truncate">{ws.companyName}</p>
                  </div>
                  {ws.id === currentWsId && <span className="text-violet-600 flex-shrink-0">{Icon.check}</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 relative">
      <button onClick={() => setOpen((o) => !o)} disabled={workspaces.length <= 1}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors group"
        style={{ cursor: workspaces.length <= 1 ? "default" : "pointer" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: wsColor(currentWsId) }}>
          {initialsFrom(currentWs?.workspaceName ?? "W")}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate">{currentWs?.workspaceName ?? "Workspace"}</p>
          <p className="text-xs text-gray-400 truncate">{currentWs?.companyName ?? ""}</p>
        </div>
        {workspaces.length > 1 && (
          <span className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {Icon.chevronDown}
          </span>
        )}
      </button>

      {open && workspaces.length > 1 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-2xl border border-gray-100 shadow-xl py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-4 pb-2">Switch workspace</p>
            {workspaces.map((ws) => {
              const isActive = ws.id === currentWsId;
              return (
                <button key={ws.id} onClick={() => switchWorkspace(ws.id)} disabled={switching || isActive}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors disabled:cursor-default"
                  style={{ background: isActive ? "#F5F3FF" : "transparent" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: wsColor(ws.id) }}>
                    {initialsFrom(ws.workspaceName)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate" style={{ color: isActive ? "#7C3AED" : "#111827" }}>
                      {ws.workspaceName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{ws.companyName}</p>
                  </div>
                  {isActive && <span className="flex-shrink-0" style={{ color: "#7C3AED" }}>{Icon.check}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Nav content ──────────────────────────────────────────────────────────────

function NavContent({ activeId, collapsed, onClose }: {
  activeId: string; collapsed: boolean; onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0"
        style={{ padding: collapsed ? "20px 0 20px" : "20px 20px 20px", justifyContent: collapsed ? "center" : "flex-start" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#111827", letterSpacing: "0.02em" }}>SYNTRA</p>
              <p className="text-[9px] tracking-[0.18em] uppercase" style={{ color: "#9CA3AF" }}>AI Meeting Co-worker</p>
            </div>
            {onClose && (
              <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                {Icon.close}
              </button>
            )}
          </>
        )}
      </div>

      {/* Workspace switcher */}
      <WorkspaceSwitcher collapsed={collapsed} />

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a key={item.id} href={item.href} title={collapsed ? item.label : undefined}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "transparent",
                color: isActive ? "#fff" : "#6B7280",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </a>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="px-3 pt-2 border-t border-gray-100">
        <a href="/dashboard/notifications" title={collapsed ? "Notifications" : undefined}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
          <span className="flex-shrink-0 relative">
            {Icon.notification}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </span>
          {!collapsed && <span>Notifications</span>}
        </a>
      </div>
    </>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar({ activeId = "dashboard" }: SidebarProps) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile topbar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 bg-white border-b border-gray-100" style={{ height: 56 }}>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Open menu">
            {Icon.menu}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>SYNTRA</p>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isMobile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <aside className="fixed top-0 left-0 z-50 h-full flex flex-col bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out"
          style={{ width: 272, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
          aria-hidden={!mobileOpen}>
          <NavContent activeId={activeId} collapsed={false} onClose={() => setMobileOpen(false)} />
        </aside>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="h-screen sticky top-0 flex flex-col border-r border-gray-100 bg-white transition-all duration-300"
          style={{ width: collapsed ? 72 : 248 }}>
          <NavContent activeId={activeId} collapsed={collapsed} />

          {/* Collapse toggle */}
          <div className="px-3 pb-4 pt-2 border-t border-gray-100" style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-start" }}>
            <button onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors w-full"
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
              <span className="flex-shrink-0">
                {collapsed ? Icon.panelRight : Icon.panelLeft}
              </span>
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}