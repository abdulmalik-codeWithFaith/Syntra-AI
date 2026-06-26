"use client";

import Sidebar from "@/components/sidebar";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationCategory = "All" | "Calendar" | "Meetings" | "Storage" | "Communication";
type IntegrationStatus = "connected" | "disconnected" | "coming_soon";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  icon: React.ReactNode;
  connectedAccount?: string;
  connectedSince?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IntegrationIcons: Record<string, React.ReactNode> = {
  googleCalendar: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#fff" />
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#E5E7EB" strokeWidth="1.5" fill="white" />
      <rect x="3" y="7" width="18" height="2" fill="#4285F4" />
      <rect x="7" y="3" width="2" height="4" rx="1" fill="#4285F4" />
      <rect x="15" y="3" width="2" height="4" rx="1" fill="#4285F4" />
      <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1A73E8">31</text>
    </svg>
  ),
  googleMeet: (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 11v6h6v-6z" /><path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" /><path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" /><path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  ),
  zoom: (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  ),
  teams: (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" />
      <circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" />
      <rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  ),
  slack: (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#4A154B" />
      <path fill="#ECB22E" d="M9 6.5a1.5 1.5 0 110 3H6.5a1.5 1.5 0 110-3H9z" />
      <path fill="#2EB67D" d="M17.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM15 6.5a1.5 1.5 0 110 3v2.5a1.5 1.5 0 11-3 0V9.5h-2.5a1.5 1.5 0 110-3H15z" />
      <path fill="#E01E5A" d="M6.5 15a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM9 17.5a1.5 1.5 0 110-3H11.5v-2.5a1.5 1.5 0 113 0V15h2.5a1.5 1.5 0 110 3H9z" />
      <path fill="#36C5F0" d="M15 17.5a1.5 1.5 0 110-3h2.5a1.5 1.5 0 110 3H15z" />
    </svg>
  ),
  notion: (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
      <path fill="#111" d="M6 5.5l1.2-.1 8.7.6c1 .1 1.5.7 1.5 1.7v9.8c0 .5-.2.9-.5 1.2l-2 1.5c-.3.2-.7.3-1.1.2L6 19.6c-.8-.1-1.3-.7-1.3-1.5V7c0-.8.5-1.4 1.3-1.5zM15 7.2l-8-0.5v11l7.5.5 1.5-1V7.2z" />
      <path fill="#111" d="M9 9h5M9 12h5M9 15h3" stroke="none" />
    </svg>
  ),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: IntegrationCategory[] = ["All", "Calendar", "Meetings", "Storage", "Communication"];

const INTEGRATIONS: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Syntra reads your calendar to auto-join scheduled meetings at the right time.",
    category: "Calendar",
    status: "connected",
    icon: IntegrationIcons.googleCalendar,
    connectedAccount: "musa@synthcorp.com",
    connectedSince: "Jan 12, 2026",
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Join Google Meet calls as an AI participant, transcribe, and extract tasks.",
    category: "Meetings",
    status: "connected",
    icon: IntegrationIcons.googleMeet,
    connectedAccount: "musa@synthcorp.com",
    connectedSince: "Jan 12, 2026",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Auto-join Zoom meetings, listen in real time, and extract decisions and tasks.",
    category: "Meetings",
    status: "connected",
    icon: IntegrationIcons.zoom,
    connectedAccount: "musa@synthcorp.com",
    connectedSince: "Jan 14, 2026",
  },
];

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
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
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search integrations..."
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

// ─── Integration card ──────────────────────────────────────────────────────────

function IntegrationCard({ integration, onToggle }: { integration: Integration; onToggle: (id: string) => void }) {
  const isConnected = integration.status === "connected";
  const isComingSoon = integration.status === "coming_soon";

  return (
    <div
      className="rounded-2xl border bg-white p-5 flex flex-col transition-all duration-150"
      style={{
        borderColor: isConnected ? "rgba(124,58,237,0.2)" : "#F3F4F6",
        boxShadow: isConnected ? "0 0 0 1px rgba(124,58,237,0.08)" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
          {integration.icon}
        </div>
        {isConnected && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1.5" style={{ background: "#ECFDF5", color: "#059669" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
        )}
        {isComingSoon && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
            Coming soon
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{integration.name}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">{integration.description}</p>

        {isConnected && (
          <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "#F9FAFB" }}>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Connected as</p>
            <p className="text-xs font-medium text-gray-700 truncate">{integration.connectedAccount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Since {integration.connectedSince}</p>
          </div>
        )}
      </div>

      {/* Action */}
      {!isComingSoon && (
        <button
          onClick={() => onToggle(integration.id)}
          className="w-full text-sm font-semibold rounded-xl py-2.5 transition-all duration-150 mt-auto"
          style={isConnected
            ? { background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" }
            : { background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff" }
          }
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      )}
      {isComingSoon && (
        <button
          disabled
          className="w-full text-sm font-medium rounded-xl py-2.5 mt-auto"
          style={{ background: "#F9FAFB", color: "#D1D5DB", border: "1.5px solid #F3F4F6", cursor: "not-allowed" }}
        >
          Coming soon
        </button>
      )}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ integrations }: { integrations: Integration[] }) {
  const connected = integrations.filter((i) => i.status === "connected").length;
  const total = integrations.filter((i) => i.status !== "coming_soon").length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-7">
      {[
        { label: "Connected", value: connected, color: "#059669", bg: "#ECFDF5" },
        { label: "Available", value: total - connected, color: "#7C3AED", bg: "#F5F3FF" },
        { label: "Coming soon", value: integrations.filter((i) => i.status === "coming_soon").length, color: "#9CA3AF", bg: "#F9FAFB" },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
            <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
          <p className="text-sm text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Disconnect modal ─────────────────────────────────────────────────────────

function DisconnectModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(17,24,39,0.4)" }} onClick={onCancel}>
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
          Syntra will stop joining {name} meetings. Existing reports and tasks will not be deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Integrations Page ─────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>("All");
  const [search, setSearch] = useState<string>("");
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  function handleToggle(id: string) {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    if (integration.status === "connected") {
      setDisconnecting(id);
    } else {
      // TODO: OAuth connect flow — window.location.href = `/api/integrations/${id}/connect`
      setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: "connected" as const, connectedAccount: "musa@synthcorp.com", connectedSince: "Now" } : i));
    }
  }

  function confirmDisconnect() {
    if (!disconnecting) return;
    // TODO: call API to revoke OAuth token — DELETE /api/integrations/:id
    setIntegrations((prev) => prev.map((i) => i.id === disconnecting ? { ...i, status: "disconnected" as const, connectedAccount: undefined, connectedSince: undefined } : i));
    setDisconnecting(null);
  }

  const filtered = integrations.filter((i) => {
    const matchCat = activeCategory === "All" || i.category === activeCategory;
    const matchSearch = search.trim() === "" || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedFirst = [...filtered].sort((a, b) => {
    const order = { connected: 0, disconnected: 1, coming_soon: 2 };
    return order[a.status] - order[b.status];
  });

  const counts: Record<IntegrationCategory, number> = {
    All: integrations.length,
    Calendar: integrations.filter((i) => i.category === "Calendar").length,
    Meetings: integrations.filter((i) => i.category === "Meetings").length,
    Storage: integrations.filter((i) => i.category === "Storage").length,
    Communication: integrations.filter((i) => i.category === "Communication").length,
  };

  const disconnectingIntegration = integrations.find((i) => i.id === disconnecting);

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="integrations" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1400px]">
        <Topbar search={search} onSearch={setSearch} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Integrations
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Connect the tools Syntra needs to join meetings, store reports, and notify your team.
            </p>
          </div>
        </div>

        <StatsBar integrations={integrations} />

        {/* Category filters */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                  color: isActive ? "#fff" : "#6B7280",
                  border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                }}
              >
                {cat}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                    color: isActive ? "#fff" : "#9CA3AF",
                  }}
                >
                  {counts[cat]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {connectedFirst.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
                <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No integrations found</p>
            <p className="text-xs text-gray-400">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {connectedFirst.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </main>

      {disconnecting && disconnectingIntegration && (
        <DisconnectModal
          name={disconnectingIntegration.name}
          onConfirm={confirmDisconnect}
          onCancel={() => setDisconnecting(null)}
        />
      )}
    </div>
  );
}