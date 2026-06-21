"use client";

import Sidebar from "@/components/sidebar";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentMode = "Assistant" | "Observer" | "Proactive";
type PlatformType = "Google Meet" | "Zoom" | "Microsoft Teams";
type VoiceOption = "Aria" | "Nova" | "Orion" | "Sage";

interface AgentSettings {
  agentName: string;
  mode: AgentMode;
  voiceEnabled: boolean;
  voice: VoiceOption;
  generatePDFs: boolean;
  taskTracking: boolean;
  meetingReminders: boolean;
  autoJoin: boolean;
  flagMissingOwners: boolean;
  flagMissingDeadlines: boolean;
}

interface ConnectedPlatform {
  platform: PlatformType;
  connected: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES: Array<{ id: AgentMode; label: string; description: string; icon: React.ReactNode }> = [
  {
    id: "Assistant",
    label: "Assistant",
    description: "Speaks only when asked or when something critical is missing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "Observer",
    label: "Observer",
    description: "Silent. Listens and extracts, never speaks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: "Proactive",
    label: "Proactive",
    description: "Speaks freely to clarify owners, deadlines, and decisions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

const VOICES: VoiceOption[] = ["Aria", "Nova", "Orion", "Sage"];

const PLATFORM_ICON: Record<PlatformType, React.ReactNode> = {
  "Google Meet": (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 11v6h6v-6z" /><path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" /><path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" /><path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  ),
  Zoom: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  ),
  "Microsoft Teams": (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" /><circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" /><rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  ),
};

const CONNECTED_PLATFORMS: ConnectedPlatform[] = [
  { platform: "Google Meet", connected: true },
  { platform: "Zoom", connected: true },
  { platform: "Microsoft Teams", connected: false },
];

const INITIAL_SETTINGS: AgentSettings = {
  agentName: "Syntra",
  mode: "Assistant",
  voiceEnabled: true,
  voice: "Nova",
  generatePDFs: true,
  taskTracking: true,
  meetingReminders: true,
  autoJoin: true,
  flagMissingOwners: true,
  flagMissingDeadlines: true,
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: checked ? "#7C3AED" : "#E5E7EB" }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
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
          placeholder="Search settings..."
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

// ─── Agent status card ──────────────────────────────────────────────────────────

function AgentStatusCard({ settings }: { settings: AgentSettings }) {
  return (
    <div
      className="rounded-2xl p-6 flex items-center gap-5 mb-6"
      style={{ background: "linear-gradient(135deg, #1A1240, #2D1B6E)" }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a3 3 0 116 0v2" />
            <circle cx="9.5" cy="13.5" r="1" fill="white" /><circle cx="14.5" cy="13.5" r="1" fill="white" />
          </svg>
        </div>
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-[3px] border-[#1A1240]" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>{settings.agentName}</h2>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.15)", color: "#86EFAC" }}>
            Active
          </span>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Running in {settings.mode} mode · Joined 25 meetings this month
        </p>
      </div>

      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        <div className="text-center">
          <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>25</p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>Meetings</p>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>89</p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>Tasks found</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────────

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-5">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-1 mb-5">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="pr-6">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Main Agent Page ────────────────────────────────────────────────────────────

export default function AgentPage() {
  const [settings, setSettings] = useState<AgentSettings>(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  function update<K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // TODO: write updated settings to Firestore — setDoc(doc(db, "workspaces", workspaceId, "agent", "config"), settings)
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-outline-violet { border: 1.5px solid rgba(124, 58, 237, 0.3); color: #7C3AED; transition: all 0.15s ease; }
        .btn-outline-violet:hover { background: rgba(124, 58, 237, 0.06); border-color: #7C3AED; }
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover:not(:disabled) { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        .btn-primary-violet:disabled { opacity: 0.6; cursor: not-allowed; }
        .syntra-input { transition: all 0.15s ease; }
        .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="agent" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1100px]">
        <Topbar />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Agent
            </h1>
            <p className="text-gray-500 text-sm mt-1">Configure how Syntra behaves in your meetings.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>

        <AgentStatusCard settings={settings} />

        {/* Identity */}
        <SettingsSection title="Agent identity">
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Agent name</label>
          <input
            type="text"
            value={settings.agentName}
            onChange={(e) => update("agentName", e.target.value)}
            className="syntra-input w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900"
          />
          <p className="text-xs text-gray-400 mt-1.5">This is the name your agent responds to when called in meetings.</p>
        </SettingsSection>

        {/* Mode */}
        <SettingsSection title="Behavior mode" description="Controls how much Syntra speaks during meetings.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map((mode) => {
              const isSelected = settings.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => update("mode", mode.id)}
                  className="text-left rounded-xl border-2 p-4 transition-all duration-200"
                  style={{
                    borderColor: isSelected ? "#7C3AED" : "#E5E7EB",
                    background: isSelected ? "#F5F3FF" : "#fff",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: isSelected ? "#EDE9FE" : "#F9FAFB", color: isSelected ? "#7C3AED" : "#9CA3AF" }}
                  >
                    {mode.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{mode.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Voice */}
        <SettingsSection title="Voice" description="Let Syntra speak in meetings using text-to-speech.">
          <ToggleRow
            label="Voice responses"
            description="Syntra can speak when asked a question or flagging something"
            checked={settings.voiceEnabled}
            onChange={(v) => update("voiceEnabled", v)}
          />
          {settings.voiceEnabled && (
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">Voice</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VOICES.map((v) => {
                  const isSelected = settings.voice === v;
                  return (
                    <button
                      key={v}
                      onClick={() => update("voice", v)}
                      className="flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all"
                      style={{
                        borderColor: isSelected ? "#7C3AED" : "#E5E7EB",
                        background: isSelected ? "#F5F3FF" : "#fff",
                        color: isSelected ? "#7C3AED" : "#6B7280",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                      </svg>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Automation */}
        <SettingsSection title="Automation" description="What Syntra does automatically, without you asking.">
          <ToggleRow
            label="Auto-join meetings"
            description="Join scheduled meetings from your calendar automatically"
            checked={settings.autoJoin}
            onChange={(v) => update("autoJoin", v)}
          />
          <ToggleRow
            label="Generate PDF reports"
            description="Create a structured report after every meeting"
            checked={settings.generatePDFs}
            onChange={(v) => update("generatePDFs", v)}
          />
          <ToggleRow
            label="Task tracking"
            description="Extract tasks, owners, and deadlines automatically"
            checked={settings.taskTracking}
            onChange={(v) => update("taskTracking", v)}
          />
          <ToggleRow
            label="Meeting reminders"
            description="Notify teammates before meetings start"
            checked={settings.meetingReminders}
            onChange={(v) => update("meetingReminders", v)}
          />
        </SettingsSection>

        {/* Flagging behavior */}
        <SettingsSection title="Flagging" description="When Syntra should call out gaps during a meeting.">
          <ToggleRow
            label="Flag tasks with no owner"
            description="Speak up when a task is mentioned but nobody is assigned"
            checked={settings.flagMissingOwners}
            onChange={(v) => update("flagMissingOwners", v)}
          />
          <ToggleRow
            label="Flag tasks with no deadline"
            description="Speak up when a task is mentioned but has no due date"
            checked={settings.flagMissingDeadlines}
            onChange={(v) => update("flagMissingDeadlines", v)}
          />
        </SettingsSection>

        {/* Connected platforms */}
        <SettingsSection title="Connected platforms" description="Where Syntra is allowed to join meetings.">
          <div className="space-y-2.5">
            {CONNECTED_PLATFORMS.map((p) => (
              <div key={p.platform} className="flex items-center gap-3.5 px-4 py-3 rounded-xl border border-gray-100">
                {PLATFORM_ICON[p.platform]}
                <p className="text-sm font-medium text-gray-900 flex-1">{p.platform}</p>
                {p.connected ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: "#ECFDF5", color: "#059669" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Connected
                  </span>
                ) : (
                  <a href="/dashboard/integrations" className="text-xs font-semibold" style={{ color: "#7C3AED" }}>
                    Connect →
                  </a>
                )}
              </div>
            ))}
          </div>
          <a href="/dashboard/integrations" className="inline-flex items-center gap-1.5 text-xs font-medium mt-4" style={{ color: "#7C3AED" }}>
            Manage all integrations
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </SettingsSection>

        {/* Danger zone */}
        <div className="rounded-2xl border p-6 mb-8" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "#991B1B" }}>Pause agent</h3>
          <p className="text-xs mb-4" style={{ color: "#B91C1C" }}>
            Syntra will stop joining meetings and stop listening until reactivated. Existing data is kept.
          </p>
          <button
            className="text-sm font-semibold rounded-xl px-5 py-2.5 border-2"
            style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "#fff" }}
          >
            Pause Syntra
          </button>
        </div>
      </main>
    </div>
  );
}