"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  updateProfile, updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import type { WorkspaceDoc, NotificationPrefsDoc } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab = "workspace" | "account" | "notifications" | "billing" | "danger";

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "workspace", label: "Workspace", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg> },
  { id: "account", label: "Account", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { id: "notifications", label: "Notifications", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg> },
  { id: "billing", label: "Billing", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
  { id: "danger", label: "Danger zone", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
];

const TIMEZONES = ["UTC","America/New_York","America/Los_Angeles","America/Chicago","Europe/London","Europe/Paris","Asia/Tokyo","Asia/Dubai","Africa/Lagos","Australia/Sydney"];
const LANGUAGES = ["English","French","Spanish","German","Portuguese"];

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="pr-8"><p className="text-sm font-medium text-gray-900">{label}</p><p className="text-xs text-gray-400 mt-0.5">{description}</p></div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

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

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function Input({ type = "text", value, onChange, placeholder, disabled }: { type?: string; value: string; onChange?: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white cursor-pointer">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SaveButton({ onSave, isSaving, saved }: { onSave: () => void; isSaving: boolean; saved: boolean }) {
  return (
    <button onClick={onSave} disabled={isSaving}
      className="text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 mt-5 disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
      {isSaving ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Saving...</>)
        : saved ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Saved</>)
        : "Save changes"}
    </button>
  );
}

function Topbar({ userName, userInitials }: { userName: string; userInitials: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </span>
        <input type="text" placeholder="Search settings..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all" />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>{userInitials}</div>
        <div className="hidden sm:block"><p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p></div>
      </div>
    </div>
  );
}

// ─── Tab: Workspace ───────────────────────────────────────────────────────────

function WorkspaceTab({ workspaceId }: { workspaceId: string }) {
  const [ws, setWs] = useState({ workspaceName: "", companyName: "", timezone: "UTC", language: "English" });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    getDoc(doc(db, "workspaces", workspaceId)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as WorkspaceDoc;
        setWs({ workspaceName: d.workspaceName, companyName: d.companyName, timezone: d.timezone, language: d.language });
      }
      setLoading(false);
    });
  }, [workspaceId]);

  function update(k: string, v: string) { setWs((p) => ({ ...p, [k]: v })); setSaved(false); }

  async function handleSave() {
    if (!workspaceId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "workspaces", workspaceId), {
        workspaceName: ws.workspaceName,
        companyName: ws.companyName,
        timezone: ws.timezone,
        language: ws.language,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  }

  if (loading) return <div className="space-y-4 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-100" />)}</div>;

  return (
    <>
      <SectionCard title="Workspace details" description="Your workspace is shared with your whole team.">
        <FormField label="Workspace name"><Input value={ws.workspaceName} onChange={(v) => update("workspaceName", v)} /></FormField>
        <FormField label="Company name"><Input value={ws.companyName} onChange={(v) => update("companyName", v)} /></FormField>
      </SectionCard>
      <SectionCard title="Locale" description="Controls time display and language across the workspace.">
        <FormField label="Timezone"><Select value={ws.timezone} onChange={(v) => update("timezone", v)} options={TIMEZONES} /></FormField>
        <FormField label="Language"><Select value={ws.language} onChange={(v) => update("language", v)} options={LANGUAGES} /></FormField>
      </SectionCard>
      <SectionCard title="Workspace ID">
        <FormField label="Your workspace ID" hint="Use this when contacting support.">
          <Input value={workspaceId} disabled />
        </FormField>
      </SectionCard>
      <SaveButton onSave={handleSave} isSaving={isSaving} saved={saved} />
    </>
  );
}

// ─── Tab: Account ─────────────────────────────────────────────────────────────

function AccountTab() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPwFields, setShowPwFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!user) return;
    setError("");
    setIsSaving(true);
    try {
      // Update display name
      if (fullName !== user.displayName) {
        await updateProfile(user, { displayName: fullName });
      }
      // Update password if requested
      if (showPwFields && newPw) {
        if (newPw.length < 8) { setError("New password must be at least 8 characters"); return; }
        if (newPw !== confirmPw) { setError("Passwords do not match"); return; }
        if (!currentPw) { setError("Current password is required"); return; }
        const credential = EmailAuthProvider.credential(user.email!, currentPw);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPw);
        setShowPwFields(false);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      if (err.code === "auth/wrong-password") setError("Current password is incorrect");
      else if (err.code === "auth/requires-recent-login") setError("Please log out and log back in before changing your password");
      else setError(err.message ?? "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (() => {
    const parts = (user?.displayName ?? "U").trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  return (
    <>
      <SectionCard title="Profile" description="Your personal account details.">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>{initials}</div>
        </div>
        <FormField label="Full name"><Input value={fullName} onChange={setFullName} /></FormField>
        <FormField label="Email address" hint="Email changes require re-verification."><Input type="email" value={email} disabled /></FormField>
      </SectionCard>
      <SectionCard title="Password">
        {!showPwFields ? (
          <button onClick={() => setShowPwFields(true)} className="text-sm font-semibold rounded-xl px-5 py-2.5 bg-white" style={{ border: "1.5px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}>
            Change password
          </button>
        ) : (
          <div className="space-y-4">
            <FormField label="Current password"><Input type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" /></FormField>
            <FormField label="New password"><Input type="password" value={newPw} onChange={setNewPw} placeholder="At least 8 characters" /></FormField>
            <FormField label="Confirm new password"><Input type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Re-enter new password" /></FormField>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={() => { setShowPwFields(false); setError(""); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
          </div>
        )}
      </SectionCard>
      <SaveButton onSave={handleSave} isSaving={isSaving} saved={saved} />
    </>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab({ uid }: { uid: string }) {
  const [notifs, setNotifs] = useState<NotificationPrefsDoc>({
    emailSummaries: true, taskReminders: true, meetingReminders: true,
    teamInviteAlerts: true, weeklyDigest: false, agentAlerts: true,
    updatedAt: null as any,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, `users/${uid}/prefs`, "notifications")).then((snap) => {
      if (snap.exists()) setNotifs(snap.data() as NotificationPrefsDoc);
      setLoading(false);
    });
  }, [uid]);

  function update(k: keyof NotificationPrefsDoc, v: boolean) {
    setNotifs((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  async function handleSave() {
    if (!uid) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, `users/${uid}/prefs`, "notifications"), {
        ...notifs, updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  }

  if (loading) return <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />;

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

// ─── Tab: Billing ─────────────────────────────────────────────────────────────

function BillingTab({ workspaceId }: { workspaceId: string }) {
  const [plan, setPlan] = useState("starter");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    getDoc(doc(db, "workspaces", workspaceId)).then((snap) => {
      if (snap.exists()) setPlan(snap.data().plan ?? "starter");
      setLoading(false);
    });
  }, [workspaceId]);

  const PLANS = [
    { id: "starter", name: "Starter", price: "$0" },
    { id: "pro",     name: "Pro",     price: "$19" },
    { id: "team",    name: "Team",    price: "$49" },
  ];

  return (
    <>
      <div className="rounded-2xl p-6 mb-5" style={{ background: "linear-gradient(135deg, #1A1240, #2D1B6E)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Current plan</p>
            <h3 className="text-white font-bold text-2xl mb-1 capitalize" style={{ fontFamily: "'Syne', sans-serif" }}>{loading ? "—" : plan}</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {plan === "starter" ? "Free forever" : plan === "pro" ? "$19 / month" : "$49 / month"}
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.15)", color: "#86EFAC" }}>Active</span>
        </div>
      </div>

      <SectionCard title="Change plan">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((p) => {
            const isCurrent = plan === p.id;
            return (
              <div key={p.id} className="rounded-xl border-2 p-4 text-center transition-all"
                style={{ borderColor: isCurrent ? "#7C3AED" : "#E5E7EB", background: isCurrent ? "#F5F3FF" : "#fff" }}>
                <p className="text-sm font-bold mb-1" style={{ color: isCurrent ? "#7C3AED" : "#111827" }}>{p.name}</p>
                <p className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif", color: isCurrent ? "#7C3AED" : "#111827" }}>
                  {p.price}<span className="text-xs font-normal text-gray-400">/mo</span>
                </p>
                {isCurrent ? (
                  <p className="text-[10px] font-semibold mt-2 uppercase tracking-wide" style={{ color: "#7C3AED" }}>Current</p>
                ) : (
                  <button className="text-xs font-semibold mt-2 text-gray-500 hover:text-violet-600 transition-colors">Switch</button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </>
  );
}

// ─── Tab: Danger ──────────────────────────────────────────────────────────────

function DangerTab({ workspaceId, uid }: { workspaceId: string; uid: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState("");

  async function handleLeave() {
    if (!workspaceId || !uid) return;
    setIsLeaving(true);
    try {
      await deleteDoc(doc(db, `workspaces/${workspaceId}/members`, uid));
      await updateDoc(doc(db, "users", uid), {
        workspaceIds: [],
        currentWorkspaceId: "",
        onboardingComplete: false,
        updatedAt: serverTimestamp(),
      });
      await logout();
      router.push("/login");
    } catch (err: any) {
      setError(err.message ?? "Failed to leave workspace");
      setIsLeaving(false);
    }
  }

  async function handleDelete() {
    if (!workspaceId || !uid) return;
    setIsDeleting(true);
    try {
      // Delete all subcollections best-effort
      const subs = ["members", "meetings", "tasks", "agent", "invites"];
      for (const sub of subs) {
        const snap = await getDocs(collection(db, `workspaces/${workspaceId}/${sub}`));
        for (const d of snap.docs) await deleteDoc(d.ref);
      }
      await deleteDoc(doc(db, "workspaces", workspaceId));
      await updateDoc(doc(db, "users", uid), {
        workspaceIds: [], currentWorkspaceId: "", onboardingComplete: false,
        updatedAt: serverTimestamp(),
      });
      await logout();
      router.push("/login");
    } catch (err: any) {
      setError(err.message ?? "Failed to delete workspace");
      setIsDeleting(false);
    }
  }

  return (
    <>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">{error}</div>}

      <SectionCard title="Export data">
        <p className="text-sm text-gray-500 mb-4">Download all your meeting transcripts, tasks, decisions, and reports as a ZIP file.</p>
        <button className="text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-2" style={{ border: "1.5px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export workspace data
        </button>
      </SectionCard>

      {/* Leave */}
      <div className="rounded-2xl border p-6 mb-5" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#991B1B" }}>Leave workspace</h3>
        <p className="text-xs mb-4" style={{ color: "#B91C1C" }}>You will lose access to all meetings, tasks, and reports. This cannot be undone.</p>
        {!showLeaveConfirm ? (
          <button onClick={() => setShowLeaveConfirm(true)} className="text-sm font-semibold rounded-xl px-5 py-2.5 border-2" style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "#fff" }}>
            Leave workspace
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: "#991B1B" }}>Type <strong>leave</strong> to confirm.</p>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoFocus
              className="w-full max-w-xs rounded-xl border px-4 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#FCA5A5" }} placeholder="leave" />
            <div className="flex gap-3">
              <button onClick={() => { setShowLeaveConfirm(false); setConfirmText(""); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
              <button disabled={confirmText !== "leave" || isLeaving} onClick={handleLeave}
                className="text-sm font-semibold rounded-xl px-5 py-2 text-white disabled:opacity-40" style={{ background: "#DC2626" }}>
                {isLeaving ? "Leaving..." : "Confirm leave"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="rounded-2xl border p-6 mb-8" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#991B1B" }}>Delete workspace</h3>
        <p className="text-xs mb-4" style={{ color: "#B91C1C" }}>Permanently delete this workspace and all data. This action is <strong>irreversible</strong>.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="text-sm font-semibold rounded-xl px-5 py-2.5" style={{ background: "#DC2626", color: "#fff" }}>
            Delete workspace
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: "#991B1B" }}>Type <strong>delete my workspace</strong> to confirm.</p>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoFocus
              className="w-full max-w-xs rounded-xl border px-4 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#FCA5A5" }} placeholder="delete my workspace" />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
              <button disabled={confirmText !== "delete my workspace" || isDeleting} onClick={handleDelete}
                className="text-sm font-semibold rounded-xl px-5 py-2 text-white disabled:opacity-40" style={{ background: "#DC2626" }}>
                {isDeleting ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, userDoc } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");

  const workspaceId = userDoc?.currentWorkspaceId ?? "";
  const uid         = user?.uid ?? "";
  const userName    = user?.displayName ?? user?.email ?? "User";
  const userInitials = (() => {
    const parts = userName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .syntra-input { transition: all 0.15s ease; }
        .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="settings" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1100px] overflow-y-auto">
        <Topbar userName={userName} userInitials={userInitials} />

        <div className="mt-8 mb-6">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your workspace, account, and preferences.</p>
        </div>

        <div className="flex gap-7 items-start">
          <aside className="w-48 flex-shrink-0 sticky top-6">
            <nav className="space-y-0.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background: isActive ? (isDanger ? "#FEF2F2" : "#F5F3FF") : "transparent",
                      color: isActive ? (isDanger ? "#DC2626" : "#7C3AED") : isDanger ? "#EF4444" : "#6B7280",
                    }}>
                    <span className="flex-shrink-0">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0 pb-10">
            {activeTab === "workspace"     && <WorkspaceTab workspaceId={workspaceId} />}
            {activeTab === "account"       && <AccountTab />}
            {activeTab === "notifications" && <NotificationsTab uid={uid} />}
            {activeTab === "billing"       && <BillingTab workspaceId={workspaceId} />}
            {activeTab === "danger"        && <DangerTab workspaceId={workspaceId} uid={uid} />}
          </div>
        </div>
      </main>
    </div>
  );
}