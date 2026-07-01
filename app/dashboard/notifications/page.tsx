"use client";

import Sidebar from "@/components/sidebar";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "task_extracted" | "task_overdue" | "task_completed"
  | "meeting_joined" | "meeting_summary" | "pdf_generated"
  | "flag_no_owner" | "flag_no_deadline"
  | "team_invite" | "team_accepted" | "agent_alert";

type FilterTab = "All" | "Meetings" | "Tasks" | "Team" | "Agent";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  meetingId?: string;
  meetingTitle?: string;
  actionLabel?: string;
  actionHref?: string;
  createdAt: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string; category: FilterTab }> = {
  meeting_joined: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" /></svg>,
    color: "#2563EB", bg: "#EFF6FF", category: "Meetings",
  },
  meeting_summary: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>,
    color: "#7C3AED", bg: "#F5F3FF", category: "Meetings",
  },
  pdf_generated: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 15v-4" /><path d="M12 15V9" /><path d="M15 15v-2" /></svg>,
    color: "#059669", bg: "#ECFDF5", category: "Meetings",
  },
  task_extracted: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
    color: "#7C3AED", bg: "#F5F3FF", category: "Tasks",
  },
  task_overdue: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    color: "#DC2626", bg: "#FEF2F2", category: "Tasks",
  },
  task_completed: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    color: "#059669", bg: "#ECFDF5", category: "Tasks",
  },
  flag_no_owner: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    color: "#B45309", bg: "#FEF3C7", category: "Agent",
  },
  flag_no_deadline: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    color: "#B45309", bg: "#FEF3C7", category: "Agent",
  },
  agent_alert: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a3 3 0 116 0v2" /><circle cx="9.5" cy="13.5" r="1" fill="currentColor" /><circle cx="14.5" cy="13.5" r="1" fill="currentColor" /></svg>,
    color: "#7C3AED", bg: "#F5F3FF", category: "Agent",
  },
  team_invite: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
    color: "#0891B2", bg: "#EFF6FF", category: "Team",
  },
  team_accepted: {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
    color: "#059669", bg: "#ECFDF5", category: "Team",
  },
};

const FILTER_TABS: FilterTab[] = ["All", "Meetings", "Tasks", "Team", "Agent"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: any): string {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function dateLabel(ts: any): string {
  if (!ts) return "Earlier";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ userName, userInitials }: { userName: string; userInitials: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </span>
        <input type="text" placeholder="Search notifications..." className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all" />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          {userInitials}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationRow({ notification, onRead, onDelete }: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = TYPE_META[notification.type];
  return (
    <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all duration-150 group"
      style={{ background: notification.read ? "#fff" : "#FAFAFF", borderColor: notification.read ? "#F3F4F6" : "rgba(124,58,237,0.15)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: meta.bg, color: meta.color }}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {!notification.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7C3AED" }} />}
              <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notification.description}</p>
            {notification.meetingTitle && (
              <a href={`/dashboard/meetings/${notification.meetingId}`}
                className="inline-flex items-center gap-1.5 mt-2 text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" /></svg>
                {notification.meetingTitle}
              </a>
            )}
            {notification.actionLabel && notification.actionHref && (
              <a href={notification.actionHref} className="inline-flex items-center gap-1 mt-2 ml-2 text-xs font-semibold transition-colors" style={{ color: "#7C3AED" }}>
                {notification.actionLabel}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notification.createdAt)}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button onClick={() => onRead(notification.id)} title="Mark as read"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-violet-600 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
              )}
              <button onClick={() => onDelete(notification.id)} title="Dismiss"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{filter === "All" ? "No notifications" : `No ${filter.toLowerCase()} notifications`}</p>
      <p className="text-xs text-gray-400">You're all caught up.</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { user, userDoc } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const userName = user?.displayName ?? user?.email ?? "User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const uid = user?.uid;

  // Real-time Firestore listener
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, `users/${uid}/notifications`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  async function markRead(id: string) {
    if (!uid) return;
    await updateDoc(doc(db, `users/${uid}/notifications/${id}`), { read: true });
  }

  async function markAllRead() {
    if (!uid) return;
    const batch = writeBatch(db);
    notifications.filter((n) => !n.read).forEach((n) => {
      batch.update(doc(db, `users/${uid}/notifications/${n.id}`), { read: true });
    });
    await batch.commit();
  }

  async function deleteNotification(id: string) {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/notifications/${id}`));
  }

  async function clearAll() {
    if (!uid) return;
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      batch.delete(doc(db, `users/${uid}/notifications/${n.id}`));
    });
    await batch.commit();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (activeFilter === "All") return notifications;
    return notifications.filter((n) => TYPE_META[n.type]?.category === activeFilter);
  }, [notifications, activeFilter]);

  const counts: Record<FilterTab, number> = {
    All: notifications.length,
    Meetings: notifications.filter((n) => TYPE_META[n.type]?.category === "Meetings").length,
    Tasks: notifications.filter((n) => TYPE_META[n.type]?.category === "Tasks").length,
    Team: notifications.filter((n) => TYPE_META[n.type]?.category === "Team").length,
    Agent: notifications.filter((n) => TYPE_META[n.type]?.category === "Agent").length,
  };

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    filtered.forEach((n) => {
      const key = dateLabel(n.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>

      <Sidebar activeId="notifications" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[900px]">
        <Topbar userName={userName} userInitials={userInitials} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">Everything Syntra and your team have flagged.</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors">
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            const unread = tab === "All"
              ? notifications.filter((n) => !n.read).length
              : notifications.filter((n) => !n.read && TYPE_META[n.type]?.category === tab).length;
            return (
              <button key={tab} onClick={() => setActiveFilter(tab)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                  color: isActive ? "#fff" : "#6B7280",
                  border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                }}>
                {tab}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : unread > 0 ? "#EDE9FE" : "#F3F4F6",
                    color: isActive ? "#fff" : unread > 0 ? "#7C3AED" : "#9CA3AF",
                  }}>
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pb-10">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse mb-2.5" />)
          ) : groups.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            groups.map(([label, items]) => (
              <div key={label} className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">{label}</p>
                <div className="space-y-2.5">
                  {items.map((n) => (
                    <NotificationRow key={n.id} notification={n} onRead={markRead} onDelete={deleteNotification} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}