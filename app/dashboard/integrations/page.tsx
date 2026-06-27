"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "disconnected" | "coming_soon";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  connectedEmail?: string;
  connectedAt?: string;
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

// ─── Icons ────────────────────────────────────────────────────────────────────

const GoogleCalendarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#E5E7EB" strokeWidth="1.5" fill="white" />
    <rect x="3" y="7" width="18" height="2" fill="#4285F4" />
    <rect x="7" y="3" width="2" height="4" rx="1" fill="#4285F4" />
    <rect x="15" y="3" width="2" height="4" rx="1" fill="#4285F4" />
    <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1A73E8">31</text>
  </svg>
);

const GoogleMeetIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24">
    <path fill="#00832D" d="M12 11v6h6v-6z" />
    <path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
    <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" />
    <path fill="#2684FC" d="M5 11v6h7v-6z" />
    <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" />
    <path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
  </svg>
);

const ZoomIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24">
    <rect width="24" height="24" rx="6" fill="#2D8CFF" />
    <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
    <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isTomorrow(iso: string): boolean {
  const d = new Date(iso);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

function getDateLabel(iso: string): string {
  if (isToday(iso)) return "Today";
  if (isTomorrow(iso)) return "Tomorrow";
  return formatDate(iso);
}

// ─── Meeting card ─────────────────────────────────────────────────────────────

function MeetingCard({ meeting }: { meeting: CalendarMeeting }) {
  const dateLabel = getDateLabel(meeting.start);
  const isNow = isToday(meeting.start);

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border bg-white hover:border-violet-200 hover:shadow-sm transition-all"
      style={{ borderColor: isNow ? "rgba(124,58,237,0.2)" : "#F3F4F6" }}>
      {/* Date block */}
      <div className="flex-shrink-0 w-14 text-center">
        <div className="rounded-xl py-2 px-1" style={{ background: isNow ? "#F5F3FF" : "#F9FAFB" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: isNow ? "#7C3AED" : "#9CA3AF" }}>
            {dateLabel === "Today" || dateLabel === "Tomorrow" ? dateLabel : new Date(meeting.start).toLocaleDateString("en-US", { month: "short" })}
          </p>
          {dateLabel !== "Today" && dateLabel !== "Tomorrow" && (
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {new Date(meeting.start).getDate()}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{meeting.title}</p>
          {isNow && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>Today</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatTime(meeting.start)} — {formatTime(meeting.end)}
        </p>
        {meeting.attendees.length > 0 && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {meeting.attendees.filter(a => !a.self).slice(0, 3).map(a => a.name ?? a.email).join(", ")}
            {meeting.attendees.filter(a => !a.self).length > 3 && ` +${meeting.attendees.filter(a => !a.self).length - 3} more`}
          </p>
        )}
      </div>

      {/* Join button */}
      {meeting.meetLink && (
        <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl text-white flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M15 10l5-5m0 0h-5m5 0v5" /><path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6" />
          </svg>
          Join
        </a>
      )}
    </div>
  );
}

// ─── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({ integration, onConnect, onDisconnect }: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}) {
  const isConnected = integration.status === "connected";
  const isComingSoon = integration.status === "coming_soon";

  const icon = integration.id === "google-calendar" ? <GoogleCalendarIcon />
    : integration.id === "google-meet" ? <GoogleMeetIcon />
    : <ZoomIcon />;

  return (
    <div className="rounded-2xl border bg-white p-5 flex flex-col transition-all duration-150"
      style={{
        borderColor: isConnected ? "rgba(124,58,237,0.2)" : "#F3F4F6",
        boxShadow: isConnected ? "0 0 0 1px rgba(124,58,237,0.08)" : "none",
      }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
          {icon}
        </div>
        {isConnected && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: "#ECFDF5", color: "#059669" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
        )}
        {isComingSoon && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
            style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
            Coming soon
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{integration.name}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">{integration.description}</p>

        {isConnected && integration.connectedEmail && (
          <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "#F9FAFB" }}>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Connected as</p>
            <p className="text-xs font-medium text-gray-700 truncate">{integration.connectedEmail}</p>
          </div>
        )}
      </div>

      {!isComingSoon && (
        <button
          onClick={() => isConnected ? onDisconnect(integration.id) : onConnect(integration.id)}
          className="w-full text-sm font-semibold rounded-xl py-2.5 transition-all duration-150 mt-auto"
          style={isConnected
            ? { background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" }
            : { background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff" }
          }>
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      )}
      {isComingSoon && (
        <button disabled className="w-full text-sm font-medium rounded-xl py-2.5 mt-auto"
          style={{ background: "#F9FAFB", color: "#D1D5DB", border: "1.5px solid #F3F4F6", cursor: "not-allowed" }}>
          Coming soon
        </button>
      )}
    </div>
  );
}

// ─── Disconnect modal ─────────────────────────────────────────────────────────

function DisconnectModal({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(17,24,39,0.4)" }} onClick={onCancel}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEF2F2" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
            <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Disconnect {name}?</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Syntra will no longer read your calendar. Existing meetings and reports won't be deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "#DC2626" }}>
            {loading ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2"
      style={{ background: type === "success" ? "#059669" : "#DC2626" }}>
      {type === "success"
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      }
      {message}
    </div>
  );
}

// ─── Main page (inner) ────────────────────────────────────────────────────────

function IntegrationsPageInner() {
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Syntra reads your calendar to show upcoming meetings with date, time, and join links.",
      status: "disconnected",
    },
    {
      id: "google-meet",
      name: "Google Meet",
      description: "Join Google Meet calls automatically. Syntra transcribes and extracts tasks in real time.",
      status: "disconnected",
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Auto-join Zoom meetings, listen in real time, and extract decisions and tasks.",
      status: "coming_soon",
    },
  ]);

  const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Check if Google is already connected on load ──────────────────────────
  useEffect(() => {
    if (!user) return;

    async function checkConnection() {
      try {
        const res = await fetch(`/api/integrations/google/meetings?uid=${user!.uid}`);
        if (res.ok) {
          const data = await res.json();
          setIntegrations((prev) => prev.map((i) =>
            i.id === "google-calendar" || i.id === "google-meet"
              ? { ...i, status: "connected" as const, connectedEmail: data.connectedEmail }
              : i
          ));
          setMeetings(data.meetings ?? []);
        }
      } catch {
        // not connected yet — that's fine
      }
    }

    checkConnection();
  }, [user]);

  // ── Handle OAuth redirect result ──────────────────────────────────────────
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "google") {
      showToast("Google Calendar connected!", "success");
      router.replace("/dashboard/integrations");
      // Reload meetings
      if (user) {
        fetchMeetings();
      }
    } else if (error === "access_denied") {
      showToast("Google connection cancelled.", "error");
      router.replace("/dashboard/integrations");
    } else if (error) {
      showToast("Failed to connect Google Calendar.", "error");
      router.replace("/dashboard/integrations");
    }
  }, [searchParams, user]);

  async function fetchMeetings() {
    if (!user) return;
    setMeetingsLoading(true);
    try {
      const res = await fetch(`/api/integrations/google/meetings?uid=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings ?? []);
        setIntegrations((prev) => prev.map((i) =>
          i.id === "google-calendar" || i.id === "google-meet"
            ? { ...i, status: "connected" as const, connectedEmail: data.connectedEmail }
            : i
        ));
      }
    } catch {
      showToast("Failed to load meetings.", "error");
    } finally {
      setMeetingsLoading(false);
    }
  }

  function handleConnect(id: string) {
    if (!user) return;
    if (id === "google-calendar" || id === "google-meet") {
      // Redirect to Google OAuth
      window.location.href = `/api/integrations/google/connect?uid=${user.uid}`;
    }
  }

  function handleDisconnect(id: string) {
    setDisconnecting(id);
  }

  async function confirmDisconnect() {
    if (!user || !disconnecting) return;
    setDisconnectLoading(true);
    try {
      const res = await fetch("/api/integrations/google/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      setIntegrations((prev) => prev.map((i) =>
        i.id === "google-calendar" || i.id === "google-meet"
          ? { ...i, status: "disconnected" as const, connectedEmail: undefined }
          : i
      ));
      setMeetings([]);
      showToast("Google Calendar disconnected.", "success");
    } catch {
      showToast("Failed to disconnect. Please try again.", "error");
    } finally {
      setDisconnectLoading(false);
      setDisconnecting(null);
    }
  }

  const isGoogleConnected = integrations.find(i => i.id === "google-calendar")?.status === "connected";
  const disconnectingIntegration = integrations.find((i) => i.id === disconnecting);

  // Group meetings by date
  const meetingsByDate = meetings.reduce<Record<string, CalendarMeeting[]>>((acc, m) => {
    const label = getDateLabel(m.start);
    if (!acc[label]) acc[label] = [];
    acc[label].push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>

      <Sidebar activeId="integrations" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1400px]">

        {/* Page header */}
        <div className="mt-2 mb-8">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
            Integrations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Connect the tools Syntra needs to join meetings and read your calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — integration cards */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Available</h2>
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>

          {/* Right — meetings from calendar */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Upcoming meetings</h2>
              {isGoogleConnected && (
                <button onClick={fetchMeetings} disabled={meetingsLoading}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 disabled:opacity-50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={meetingsLoading ? "animate-spin" : ""}>
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Refresh
                </button>
              )}
            </div>

            {!isGoogleConnected ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">No calendar connected</p>
                <p className="text-xs text-gray-400 mb-5 max-w-xs">
                  Connect Google Calendar to see your upcoming meetings with date, time, and join links.
                </p>
                <button onClick={() => handleConnect("google-calendar")}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                  Connect Google Calendar
                </button>
              </div>
            ) : meetingsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">No upcoming meetings</p>
                <p className="text-xs text-gray-400">No meetings with video links found in the next 30 days.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(meetingsByDate).map(([dateLabel, dayMeetings]) => (
                  <div key={dateLabel}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{dateLabel}</p>
                    <div className="space-y-2">
                      {dayMeetings.map((m) => (
                        <MeetingCard key={m.id} meeting={m} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {disconnecting && disconnectingIntegration && (
        <DisconnectModal
          name={disconnectingIntegration.name}
          onConfirm={confirmDisconnect}
          onCancel={() => setDisconnecting(null)}
          loading={disconnectLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={null}>
      <IntegrationsPageInner />
    </Suspense>
  );
}