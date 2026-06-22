"use client";

import Sidebar from "@/components/sidebar";
import { useState, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab = "workspace" | "account" | "notifications" | "billing" | "danger";

interface WorkspaceSettings {
  workspaceName: string;
  companyName: string;
  timezone: string;
  language: string;
}

interface AccountSettings {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailSummaries: boolean;
  taskReminders: boolean;
  meetingReminders: boolean;
  teamInviteAlerts: boolean;
  weeklyDigest: boolean;
  agentAlerts: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "workspace",
    label: "Workspace",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    id: "billing",
    label: "Billing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "danger",
    label: "Danger zone",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago",
  "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Dubai",
  "Africa/Lagos", "Australia/Sydney",
];

const LANGUAGES = ["English", "French", "Spanish", "German", "Portuguese"];

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

// ─── Shared primitives ─────────────────────────────────────────────────────────

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-5">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-0.5 mb-5">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}: {
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white cursor-pointer"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="pr-8">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SaveButton({
  onSave,
  isSaving,
  saved,
}: {
  onSave: () => void;
  isSaving: boolean;
  saved: boolean;
}) {
  return (
    <button
      onClick={onSave}
      disabled={isSaving}
      className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 mt-5"
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
  );
}

// ─── Tab: Workspace ────────────────────────────────────────────────────────────

function WorkspaceTab() {
  const [ws, setWs] = useState<WorkspaceSettings>({
    workspaceName: "Product Team",
    companyName: "Acme Technologies",
    timezone: "Africa/Lagos",
    language: "English",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    // TODO: update Firestore workspace document
    await new Promise((r) => setTimeout(r, 900));
    setSaved(true);
    setIsSaving(false);
  }

  function update<K extends keyof WorkspaceSettings>(k: K, v: WorkspaceSettings[K]) {
    setWs((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  return (
    <>
      <SectionCard title="Workspace details" description="Your workspace is shared with your whole team.">
        <FormField label="Workspace name">
          <Input value={ws.workspaceName} onChange={(v) => update("workspaceName", v)} />
        </FormField>
        <FormField label="Company name">
          <Input value={ws.companyName} onChange={(v) => update("companyName", v)} />
        </FormField>
      </SectionCard>

      <SectionCard title="Locale" description="Controls time display and language across the workspace.">
        <FormField label="Timezone">
          <Select value={ws.timezone} onChange={(v) => update("timezone", v)} options={TIMEZONES} />
        </FormField>
        <FormField label="Language">
          <Select value={ws.language} onChange={(v) => update("language", v)} options={LANGUAGES} />
        </FormField>
      </SectionCard>

      <SectionCard title="Workspace ID">
        <FormField label="Your workspace ID" hint="Use this when contacting support.">
          <Input value="ws_9f3e2b4c7a1d6f8e" disabled />
        </FormField>
      </SectionCard>

      <SaveButton onSave={handleSave} isSaving={isSaving} saved={saved} />
    </>
  );
}

// ─── Tab: Account ──────────────────────────────────────────────────────────────

function AccountTab() {
  const [account, setAccount] = useState<AccountSettings>({
    fullName: "Musa Imran",
    email: "musa@synthcorp.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwFields, setShowPwFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  function update<K extends keyof AccountSettings>(k: K, v: AccountSettings[K]) {
    setAccount((p) => ({ ...p, [k]: v }));
    setSaved(false);
    setPwError("");
  }

  async function handleSave() {
    if (showPwFields) {
      if (!account.currentPassword) { setPwError("Current password is required"); return; }
      if (account.newPassword.length < 8) { setPwError("New password must be at least 8 characters"); return; }
      if (account.newPassword !== account.confirmPassword) { setPwError("Passwords do not match"); return; }
    }
    setIsSaving(true);
    // TODO: update Firebase Auth displayName / email / password
    await new Promise((r) => setTimeout(r, 900));
    setSaved(true);
    setIsSaving(false);
    setShowPwFields(false);
    setAccount((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
  }

  return (
    <>
      <SectionCard title="Profile" description="Your personal account details.">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
            MI
          </div>
          <button className="btn-outline-violet text-xs font-semibold rounded-lg px-4 py-2 bg-white">
            Change photo
          </button>
        </div>
        <FormField label="Full name">
          <Input value={account.fullName} onChange={(v) => update("fullName", v)} />
        </FormField>
        <FormField label="Email address" hint="Changing your email requires re-verification.">
          <Input type="email" value={account.email} onChange={(v) => update("email", v)} />
        </FormField>
      </SectionCard>

      <SectionCard title="Password">
        {!showPwFields ? (
          <button
            onClick={() => setShowPwFields(true)}
            className="btn-outline-violet text-sm font-semibold rounded-xl px-5 py-2.5 bg-white"
          >
            Change password
          </button>
        ) : (
          <div className="space-y-4">
            <FormField label="Current password">
              <Input type="password" value={account.currentPassword} onChange={(v) => update("currentPassword", v)} placeholder="••••••••" />
            </FormField>
            <FormField label="New password">
              <Input type="password" value={account.newPassword} onChange={(v) => update("newPassword", v)} placeholder="At least 8 characters" />
            </FormField>
            <FormField label="Confirm new password">
              <Input type="password" value={account.confirmPassword} onChange={(v) => update("confirmPassword", v)} placeholder="Re-enter new password" />
            </FormField>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <button onClick={() => { setShowPwFields(false); setPwError(""); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </SectionCard>

      <SaveButton onSave={handleSave} isSaving={isSaving} saved={saved} />
    </>
  );
}

// ─── Tab: Notifications ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [notifs, setNotifs] = useState<NotificationSettings>({
    emailSummaries: true,
    taskReminders: true,
    meetingReminders: true,
    teamInviteAlerts: true,
    weeklyDigest: false,
    agentAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof NotificationSettings>(k: K, v: boolean) {
    setNotifs((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  async function handleSave() {
    setIsSaving(true);
    // TODO: write notification prefs to Firestore user document
    await new Promise((r) => setTimeout(r, 900));
    setSaved(true);
    setIsSaving(false);
  }

  return (
    <>
      <SectionCard title="Email notifications" description="Choose what Syntra sends to your inbox.">
        <ToggleRow label="Meeting summaries" description="Receive a summary email after each meeting" checked={notifs.emailSummaries} onChange={(v) => update("emailSummaries", v)} />
        <ToggleRow label="Task reminders" description="Get reminded about overdue or upcoming tasks" checked={notifs.taskReminders} onChange={(v) => update("taskReminders", v)} />
        <ToggleRow label="Meeting reminders" description="Email reminder before a meeting begins" checked={notifs.meetingReminders} onChange={(v) => update("meetingReminders", v)} />
        <ToggleRow label="Team invite alerts" description="Notify when a teammate accepts an invite" checked={notifs.teamInviteAlerts} onChange={(v) => update("teamInviteAlerts", v)} />
        <ToggleRow label="Weekly digest" description="A roundup of meetings and tasks every Monday" checked={notifs.weeklyDigest} onChange={(v) => update("weeklyDigest", v)} />
      </SectionCard>

      <SectionCard title="Agent alerts" description="Notifications from Syntra about your meetings.">
        <ToggleRow label="Agent alerts" description="Get notified when Syntra flags a missing task owner or deadline" checked={notifs.agentAlerts} onChange={(v) => update("agentAlerts", v)} />
      </SectionCard>

      <SaveButton onSave={handleSave} isSaving={isSaving} saved={saved} />
    </>
  );
}

// ─── Tab: Billing ──────────────────────────────────────────────────────────────

function BillingTab() {
  return (
    <>
      {/* Current plan */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: "linear-gradient(135deg, #1A1240, #2D1B6E)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Current plan</p>
            <h3 className="text-white font-bold text-2xl mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Pro</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>$19 / month · Renews Jul 12, 2026</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.15)", color: "#86EFAC" }}>
            Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Meetings used", value: "25 / ∞" },
            { label: "Team members", value: "8 / ∞" },
            { label: "Storage used", value: "2.4 / ∞ GB" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-bold text-white text-sm">{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionCard title="Payment method">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-md border border-gray-200 flex items-center justify-center bg-gray-50">
              <svg width="20" height="13" viewBox="0 0 40 26" fill="none">
                <rect width="40" height="26" rx="4" fill="#f7f7f7" />
                <circle cx="15" cy="13" r="8" fill="#EB001B" opacity="0.9" />
                <circle cx="25" cy="13" r="8" fill="#F79E1B" opacity="0.9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Mastercard ending in 4242</p>
              <p className="text-xs text-gray-400">Expires 08 / 2027</p>
            </div>
          </div>
          <button className="text-xs font-semibold" style={{ color: "#7C3AED" }}>Update</button>
        </div>
      </SectionCard>

      <SectionCard title="Billing history" description="Your last 5 invoices.">
        <div className="space-y-0 divide-y divide-gray-50">
          {[
            { date: "Jun 12, 2026", amount: "$19.00", status: "Paid" },
            { date: "May 12, 2026", amount: "$19.00", status: "Paid" },
            { date: "Apr 12, 2026", amount: "$19.00", status: "Paid" },
            { date: "Mar 12, 2026", amount: "$19.00", status: "Paid" },
            { date: "Feb 12, 2026", amount: "$19.00", status: "Paid" },
          ].map((inv) => (
            <div key={inv.date} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{inv.date}</p>
                <p className="text-xs text-gray-400">Pro plan · Monthly</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">{inv.amount}</span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "#ECFDF5", color: "#059669" }}>{inv.status}</span>
                <button className="text-xs font-medium" style={{ color: "#7C3AED" }}>PDF</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Change plan">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Starter", price: "$0", current: false },
            { name: "Pro", price: "$19", current: true },
            { name: "Team", price: "$49", current: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border-2 p-4 text-center transition-all"
              style={{
                borderColor: plan.current ? "#7C3AED" : "#E5E7EB",
                background: plan.current ? "#F5F3FF" : "#fff",
              }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: plan.current ? "#7C3AED" : "#111827" }}>{plan.name}</p>
              <p className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif", color: plan.current ? "#7C3AED" : "#111827" }}>{plan.price}<span className="text-xs font-normal text-gray-400">/mo</span></p>
              {plan.current ? (
                <p className="text-[10px] font-semibold mt-2 uppercase tracking-wide" style={{ color: "#7C3AED" }}>Current</p>
              ) : (
                <button className="text-xs font-semibold mt-2 text-gray-500 hover:text-violet-600 transition-colors">Switch</button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

// ─── Tab: Danger zone ──────────────────────────────────────────────────────────

function DangerTab() {
  const [confirmText, setConfirmText] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);

  return (
    <>
      <SectionCard title="Export data">
        <p className="text-sm text-gray-500 mb-4">Download all your meeting transcripts, tasks, decisions, and reports as a ZIP file.</p>
        <button className="btn-outline-violet text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export workspace data
        </button>
      </SectionCard>

      <div className="rounded-2xl border p-6 mb-5" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#991B1B" }}>Leave workspace</h3>
        <p className="text-xs mb-4" style={{ color: "#B91C1C" }}>
          You will lose access to all meetings, tasks, and reports in this workspace. This cannot be undone.
        </p>
        {!showLeaveConfirm ? (
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="text-sm font-semibold rounded-xl px-5 py-2.5 border-2"
            style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "#fff" }}
          >
            Leave workspace
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: "#991B1B" }}>Are you sure? Type <strong>leave</strong> to confirm.</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full max-w-xs rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#FCA5A5" }}
              placeholder="leave"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowLeaveConfirm(false); setConfirmText(""); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
              <button
                disabled={confirmText !== "leave"}
                className="text-sm font-semibold rounded-xl px-5 py-2 text-white transition-opacity disabled:opacity-40"
                style={{ background: "#DC2626" }}
                onClick={() => {
                  // TODO: remove user from workspace Firestore doc, redirect to /login
                }}
              >
                Confirm leave
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-6 mb-8" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#991B1B" }}>Delete workspace</h3>
        <p className="text-xs mb-4" style={{ color: "#B91C1C" }}>
          Permanently delete this workspace and all data including meetings, tasks, reports, and team members. This action is <strong>irreversible</strong>.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm font-semibold rounded-xl px-5 py-2.5"
            style={{ background: "#DC2626", color: "#fff" }}
          >
            Delete workspace
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: "#991B1B" }}>
              Type <strong>delete my workspace</strong> to permanently delete everything.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full max-w-xs rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#FCA5A5" }}
              placeholder="delete my workspace"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
              <button
                disabled={confirmText !== "delete my workspace"}
                className="text-sm font-semibold rounded-xl px-5 py-2 text-white transition-opacity disabled:opacity-40"
                style={{ background: "#DC2626" }}
                onClick={() => {
                  // TODO: delete Firestore workspace, all sub-collections, Cloudinary assets, Firebase Auth records, router.push('/')
                }}
              >
                Permanently delete
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Settings Page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .syntra-input { transition: all 0.15s ease; }
        .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12); }
        .btn-outline-violet { border: 1.5px solid rgba(124, 58, 237, 0.3); color: #7C3AED; transition: all 0.15s ease; }
        .btn-outline-violet:hover { background: rgba(124, 58, 237, 0.06); border-color: #7C3AED; }
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover:not(:disabled) { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        .btn-primary-violet:disabled { opacity: 0.6; cursor: not-allowed; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="settings" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1100px]">
        <Topbar />

        {/* Page header */}
        <div className="mt-8 mb-6">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
            Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your workspace, account, and preferences.</p>
        </div>

        <div className="flex gap-7 items-start">
          {/* Left tabs nav */}
          <aside className="w-48 flex-shrink-0 sticky top-6">
            <nav className="space-y-0.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background: isActive ? (isDanger ? "#FEF2F2" : "#F5F3FF") : "transparent",
                      color: isActive ? (isDanger ? "#DC2626" : "#7C3AED") : isDanger ? "#EF4444" : "#6B7280",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span className="flex-shrink-0">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right content */}
          <div className="flex-1 min-w-0 pb-10">
            {activeTab === "workspace" && <WorkspaceTab />}
            {activeTab === "account" && <AccountTab />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "danger" && <DangerTab />}
          </div>
        </div>
      </main>
    </div>
  );
}