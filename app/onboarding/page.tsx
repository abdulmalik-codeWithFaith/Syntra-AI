"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkspaceData {
  companyName: string;
  workspaceName: string;
  agentName: string;
}

interface PlatformData {
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "Custom Link" | null;
  meetingLink: string;
}

interface AgentConfigData {
  voiceEnabled: boolean;
  mode: "Assistant" | "Observer" | "Proactive";
  generatePDFs: boolean;
  taskTracking: boolean;
  meetingReminders: boolean;
}

interface OnboardingData {
  workspace: WorkspaceData;
  platformConfig: PlatformData;
  agentConfig: AgentConfigData;
  team: string[];
}

interface StepMeta {
  number: number;
  label: string;
}

interface PlatformOption {
  id: "Google Meet" | "Zoom" | "Microsoft Teams" | "Custom Link";
  name: string;
  icon: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: StepMeta[] = [
  { number: 1, label: "Workspace" },
  { number: 2, label: "Platform" },
  { number: 3, label: "Agent" },
  { number: 4, label: "Team" },
  { number: 5, label: "Activate" },
];

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: "Google Meet",
    name: "Google Meet",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24">
        <path fill="#00832D" d="M12 11v6h6v-6z" />
        <path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
        <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" />
        <path fill="#2684FC" d="M5 11v6h7v-6z" />
        <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" />
        <path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
      </svg>
    ),
  },
  {
    id: "Zoom",
    name: "Zoom Meeting",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="6" fill="#2D8CFF" />
        <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
        <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
      </svg>
    ),
  },
  {
    id: "Microsoft Teams",
    name: "Microsoft Teams",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24">
        <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" />
        <circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
        <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" />
        <rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
      </svg>
    ),
  },
  {
    id: "Custom Link",
    name: "Custom Link",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round">
        <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
        <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
      </svg>
    ),
  },
];

const MODES: Array<{ id: AgentConfigData["mode"]; label: string; description: string }> = [
  { id: "Assistant", label: "Assistant", description: "Speaks only when asked or when something critical is missing" },
  { id: "Observer", label: "Observer", description: "Silent. Listens and extracts, never speaks" },
  { id: "Proactive", label: "Proactive", description: "Speaks freely to clarify owners, deadlines, and decisions" },
];

// ─── Firebase: write everything ───────────────────────────────────────────────
// Called on Step 5 "Activate". Creates:
//  1. workspaces/{workspaceId}            — workspace document
//  2. workspaces/{workspaceId}/members/{uid} — owner member doc
//  3. workspaces/{workspaceId}/agent/config  — agent config doc
//  4. invites/{email}                     — one invite per teammate email
//  5. users/{uid}                         — marks onboarding complete

async function activateSyntra(
  uid: string,
  email: string,
  fullName: string,
  data: OnboardingData
): Promise<string> {
  // 1. Generate workspace ID
  const workspaceRef = doc(collection(db, "workspaces"));
  const workspaceId = workspaceRef.id;

  // 2. Create workspace document
  await setDoc(workspaceRef, {
    id: workspaceId,
    companyName: data.workspace.companyName,
    workspaceName: data.workspace.workspaceName,
    ownerId: uid,
    plan: "starter",
    timezone: "UTC",
    language: "English",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 3. Add owner as first member
  await setDoc(doc(db, "workspaces", workspaceId, "members", uid), {
    uid,
    email,
    fullName,
    photoURL: null,
    role: "Owner",
    status: "Active",
    joinedAt: serverTimestamp(),
    invitedAt: serverTimestamp(),
  });

  // 4. Create agent config
  await setDoc(doc(db, "workspaces", workspaceId, "agent", "config"), {
    agentName: data.workspace.agentName,
    mode: data.agentConfig.mode,
    voiceEnabled: data.agentConfig.voiceEnabled,
    voice: "Nova",
    generatePDFs: data.agentConfig.generatePDFs,
    taskTracking: data.agentConfig.taskTracking,
    meetingReminders: data.agentConfig.meetingReminders,
    autoJoin: true,
    flagMissingOwners: true,
    flagMissingDeadlines: true,
    status: "active",
    connectedPlatforms: {
      googleMeet: data.platformConfig.platform === "Google Meet",
      zoom: data.platformConfig.platform === "Zoom",
      microsoftTeams: data.platformConfig.platform === "Microsoft Teams",
    },
    meetingLink: data.platformConfig.meetingLink || null,
    updatedAt: serverTimestamp(),
  });

  // 5. Write invite docs for each teammate email
  // Key format: email with dots replaced by underscores (Firestore key safe)
  // When a teammate signs up, bootstrapNewUser() in signup reads this
  // and auto-accepts them into this workspace — no extra clicks needed.
  const validEmails = data.team.filter((e) => e.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()));

  await Promise.all(
    validEmails.map((rawEmail) => {
      const inviteKey = rawEmail.toLowerCase().trim().replace(/\./g, "_");
      return setDoc(doc(db, "invites", inviteKey), {
        workspaceId,
        workspaceName: data.workspace.workspaceName,
        invitedBy: uid,
        invitedByName: fullName,
        email: rawEmail.toLowerCase().trim(),
        role: "Member",
        consumed: false,
        invitedAt: serverTimestamp(),
      });
    })
  );

  // 6. Mark user onboarding complete + link to workspace
  await setDoc(
    doc(db, "users", uid),
    {
      onboardingComplete: true,
      currentWorkspaceId: workspaceId,
      workspaceIds: [workspaceId],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 7. Send invite emails via Nodemailer API route
  if (validEmails.length > 0) {
    try {
      await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: validEmails,
          workspaceName: data.workspace.workspaceName,
          invitedByName: fullName,
          workspaceId,
        }),
      });
    } catch {
      // Non-critical — invites still exist in Firestore even if email fails
      console.warn("Invite emails could not be sent. Firestore invites still created.");
    }
  }

  return workspaceId;
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      </div>
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#111827", letterSpacing: "0.02em" }}>SYNTRA</span>
      <span className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#9CA3AF" }}>AI Sync and Strategy</span>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-10 w-full max-w-md mx-auto">
      {STEPS.map((step, i) => {
        const isComplete = step.number < current;
        const isActive = step.number === current;
        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                style={{
                  background: isComplete || isActive ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#F3F4F6",
                  color: isComplete || isActive ? "#fff" : "#9CA3AF",
                  boxShadow: isActive ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
                }}
              >
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : step.number}
              </div>
              <span className="text-[10px] font-medium tracking-wide uppercase hidden sm:block"
                style={{ color: isActive ? "#7C3AED" : "#9CA3AF" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 transition-all duration-300 rounded-full"
                style={{
                  background: isComplete ? "linear-gradient(90deg, #2563EB, #7C3AED)" : "#F3F4F6",
                  marginBottom: "20px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: checked ? "#7C3AED" : "#E5E7EB" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
    </button>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepWorkspace({ data, onChange, onNext }: { data: WorkspaceData; onChange: (d: WorkspaceData) => void; onNext: () => void }) {
  const canProceed = data.companyName.trim() && data.workspaceName.trim() && data.agentName.trim();

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && canProceed) onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Step 1: Workspace Setup</h1>
      <p className="text-gray-500 text-sm mb-8">Tell us a bit about your company and your AI agent.</p>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Company Name</label>
          <input type="text" placeholder="e.g., Synthcorp Labs" value={data.companyName} autoFocus
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            onKeyDown={handleKeyDown}
            className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Workspace Name</label>
          <input type="text" placeholder="e.g., Product Team" value={data.workspaceName}
            onChange={(e) => onChange({ ...data, workspaceName: e.target.value })}
            onKeyDown={handleKeyDown}
            className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">AI Agent Name</label>
          <input type="text" placeholder="e.g., Syntra" value={data.agentName}
            onChange={(e) => onChange({ ...data, agentName: e.target.value })}
            onKeyDown={handleKeyDown}
            className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400" />
          <p className="text-xs text-gray-400 mt-1.5">This is the name your agent responds to in meetings.</p>
        </div>
      </div>
      <button onClick={onNext} disabled={!canProceed}
        className="btn-primary-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 mt-8">
        Next
      </button>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function StepPlatform({ data, onChange, onNext, onBack }: { data: PlatformData; onChange: (d: PlatformData) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Step 2: Connect Platform</h1>
      <p className="text-gray-500 text-sm mb-8">Choose where Syntra will join your meetings.</p>
      <div className="grid grid-cols-2 gap-4">
        {PLATFORM_OPTIONS.map((opt) => {
          const isSelected = data.platform === opt.id;
          return (
            <button key={opt.id} onClick={() => onChange({ ...data, platform: opt.id })}
              className="text-left rounded-2xl border-2 p-5 transition-all duration-200"
              style={{ borderColor: isSelected ? "#7C3AED" : "#E5E7EB", background: isSelected ? "#F5F3FF" : "#fff" }}>
              <div className="mb-3">{opt.icon}</div>
              <p className="text-sm font-semibold text-gray-900">{opt.name}</p>
            </button>
          );
        })}
      </div>
      {data.platform && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-800 mb-1.5">
            {data.platform === "Custom Link" ? "Meeting link" : `${data.platform} link (optional)`}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
                <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
              </svg>
            </span>
            <input type="url" placeholder="https://meet.google.com/abc-defg-hij" value={data.meetingLink}
              onChange={(e) => onChange({ ...data, meetingLink: e.target.value })}
              className="syntra-input w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400" />
          </div>
        </div>
      )}
      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="btn-outline-violet flex-1 font-semibold text-sm rounded-xl py-3.5 bg-white">Back</button>
        <button onClick={onNext} disabled={data.platform === null}
          className="btn-primary-violet flex-[2] text-white font-semibold text-sm rounded-xl py-3.5">Next</button>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function StepAgentConfig({ data, onChange, onNext, onBack }: { data: AgentConfigData; onChange: (d: AgentConfigData) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Step 3: Agent Configuration</h1>
      <p className="text-gray-500 text-sm mb-8">Decide how Syntra behaves during your meetings.</p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 mb-3">Mode</label>
        <div className="space-y-2.5">
          {MODES.map((mode) => {
            const isSelected = data.mode === mode.id;
            return (
              <button key={mode.id} onClick={() => onChange({ ...data, mode: mode.id })}
                className="w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-200 flex items-start gap-3"
                style={{ borderColor: isSelected ? "#7C3AED" : "#E5E7EB", background: isSelected ? "#F5F3FF" : "#fff" }}>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: isSelected ? "#7C3AED" : "#D1D5DB" }}>
                  {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED" }} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{mode.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{mode.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1 rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {[
          { key: "voiceEnabled" as const, label: "Voice Responses", desc: "Syntra can speak during meetings" },
          { key: "generatePDFs" as const, label: "Generate PDFs", desc: "Auto-create a report after each meeting" },
          { key: "taskTracking" as const, label: "Task Tracking", desc: "Extract and track tasks automatically" },
          { key: "meetingReminders" as const, label: "Meeting Reminders", desc: "Notify your team before meetings start" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={data[item.key]} onChange={(v) => onChange({ ...data, [item.key]: v })} />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="btn-outline-violet flex-1 font-semibold text-sm rounded-xl py-3.5 bg-white">Back</button>
        <button onClick={onNext} className="btn-primary-violet flex-[2] text-white font-semibold text-sm rounded-xl py-3.5">Next</button>
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function StepTeam({ data, onChange, onNext, onBack }: { data: string[]; onChange: (d: string[]) => void; onNext: () => void; onBack: () => void }) {
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});

  function updateEmail(index: number, value: string) {
    const next = [...data];
    next[index] = value;
    onChange(next);
    if (emailErrors[index]) {
      setEmailErrors((prev) => { const e = { ...prev }; delete e[index]; return e; });
    }
  }

  function validateAndNext() {
    const errors: Record<number, string> = {};
    data.forEach((email, i) => {
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors[i] = "Invalid email address";
      }
    });
    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      return;
    }
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Step 4: Invite Your Team</h1>
      <p className="text-gray-500 text-sm mb-2">Optional — invite teammates now or later from your dashboard.</p>
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 mb-6 flex gap-2.5">
        <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          Invited teammates will receive an email. When they sign up, they&apos;ll automatically join your workspace as <strong>Members</strong> — no extra steps needed.
        </p>
      </div>
      <label className="block text-sm font-medium text-gray-800 mb-3">Email addresses</label>
      <div className="space-y-3">
        {data.map((email, i) => (
          <div key={i}>
            <div className="relative">
              <input type="email" placeholder="teammate@company.com" value={email}
                onChange={(e) => updateEmail(i, e.target.value)}
                className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${emailErrors[i] ? "border-red-300" : "border-gray-200"}`} />
              {data.length > 1 && (
                <button onClick={() => onChange(data.filter((_, idx) => idx !== i))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            {emailErrors[i] && <p className="text-xs text-red-500 mt-1">{emailErrors[i]}</p>}
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...data, ""])}
        className="btn-outline-violet w-full font-medium text-sm rounded-xl py-3 mt-3 bg-white flex items-center justify-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add more
      </button>
      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="btn-outline-violet flex-1 font-semibold text-sm rounded-xl py-3.5 bg-white">Back</button>
        <button onClick={validateAndNext} className="btn-primary-violet flex-[2] text-white font-semibold text-sm rounded-xl py-3.5">Next</button>
      </div>
      <button onClick={onNext} className="w-full text-center text-xs text-gray-400 mt-4 hover:text-gray-600 transition-colors">
        Skip this step
      </button>
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

function StepActivate({ summary, onActivate, onBack, isActivating, error }: {
  summary: OnboardingData;
  onActivate: () => void;
  onBack: () => void;
  isActivating: boolean;
  error: string | null;
}) {
  const validInvites = summary.team.filter((e) => e.trim()).length;

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Ready to activate Syntra</h1>
      <p className="text-gray-500 text-sm mb-8">Review your setup, then bring your agent online.</p>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 text-left">
          {error}
        </div>
      )}

      <div className="text-left rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-8 overflow-hidden">
        {[
          { label: "Workspace", value: summary.workspace.workspaceName || "—" },
          { label: "Company", value: summary.workspace.companyName || "—" },
          { label: "Agent name", value: summary.workspace.agentName || "—" },
          { label: "Platform", value: summary.platformConfig.platform || "—" },
          { label: "Mode", value: summary.agentConfig.mode },
          { label: "Voice responses", value: summary.agentConfig.voiceEnabled ? "Enabled" : "Disabled" },
          { label: "PDF reports", value: summary.agentConfig.generatePDFs ? "Enabled" : "Disabled" },
          { label: "Teammates to invite", value: validInvites > 0 ? `${validInvites} invite${validInvites > 1 ? "s" : ""} will be sent` : "None" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isActivating}
          className="btn-outline-violet flex-1 font-semibold text-sm rounded-xl py-3.5 bg-white">Back</button>
        <button onClick={onActivate} disabled={isActivating}
          className="btn-primary-violet flex-[2] text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2">
          {isActivating ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Setting up workspace...
            </>
          ) : "Activate Syntra"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userDoc } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activateError, setActivateError] = useState<string | null>(null);

  const [workspace, setWorkspace] = useState<WorkspaceData>({ companyName: "", workspaceName: "", agentName: "" });
  const [platformConfig, setPlatformConfig] = useState<PlatformData>({ platform: null, meetingLink: "" });
  const [agentConfig, setAgentConfig] = useState<AgentConfigData>({
    voiceEnabled: true, mode: "Assistant", generatePDFs: true, taskTracking: true, meetingReminders: true,
  });
  const [team, setTeam] = useState<string[]>([""]);

  function goNext() { setCurrentStep((s) => Math.min(s + 1, STEPS.length)); }
  function goBack() { setCurrentStep((s) => Math.max(s - 1, 1)); }

  async function handleActivate() {
    if (!user) {
      setActivateError("You must be signed in to activate Syntra.");
      return;
    }
    setIsActivating(true);
    setActivateError(null);

    try {
      await activateSyntra(
        user.uid,
        user.email ?? userDoc?.email ?? "",
        user.displayName ?? userDoc?.fullName ?? "Workspace Owner",
        { workspace, platformConfig, agentConfig, team }
      );
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Onboarding activation failed:", err);
      setActivateError("Something went wrong setting up your workspace. Please try again.");
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');
        .syntra-input { transition: all 0.15s ease; }
        .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .btn-primary-violet { background: linear-gradient(135deg,#7C3AED,#6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover:not(:disabled) { background: linear-gradient(135deg,#8B5CF6,#7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); transform: translateY(-1px); }
        .btn-primary-violet:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline-violet { border: 1.5px solid rgba(124,58,237,0.3); color: #7C3AED; transition: all 0.15s ease; }
        .btn-outline-violet:hover:not(:disabled) { background: rgba(124,58,237,0.06); border-color: #7C3AED; }
        .card-border-glow { box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 24px 60px -16px rgba(124,58,237,0.18); }
        @keyframes fadeSlide { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        .step-enter { animation: fadeSlide 0.35s ease both; }
      `}</style>

      <div className="w-full max-w-lg rounded-3xl border bg-white px-8 py-10 sm:px-12 sm:py-12 card-border-glow"
        style={{ borderColor: "rgba(124,58,237,0.15)" }}>
        <Logo />
        <StepIndicator current={currentStep} />

        <div key={currentStep} className="step-enter">
          {currentStep === 1 && <StepWorkspace data={workspace} onChange={setWorkspace} onNext={goNext} />}
          {currentStep === 2 && <StepPlatform data={platformConfig} onChange={setPlatformConfig} onNext={goNext} onBack={goBack} />}
          {currentStep === 3 && <StepAgentConfig data={agentConfig} onChange={setAgentConfig} onNext={goNext} onBack={goBack} />}
          {currentStep === 4 && <StepTeam data={team} onChange={setTeam} onNext={goNext} onBack={goBack} />}
          {currentStep === 5 && (
            <StepActivate
              summary={{ workspace, platformConfig, agentConfig, team }}
              onActivate={handleActivate}
              onBack={goBack}
              isActivating={isActivating}
              error={activateError}
            />
          )}
        </div>
      </div>
    </div>
  );
}