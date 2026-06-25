"use client";

import Sidebar from "@/components/sidebar";
import { useState, useMemo, useEffect, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { MemberDoc, MemberRole } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "All" | MemberRole;

interface MemberRow extends MemberDoc {
  id: string; // Firestore doc id
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = ["All", "Owner", "Admin", "Member"];

const ROLE_STYLES: Record<MemberRole, { bg: string; color: string }> = {
  Owner: { bg: "#FCE7F3", color: "#9D174D" },
  Admin: { bg: "#DBEAFE", color: "#1E40AF" },
  Member: { bg: "#F3F4F6", color: "#4B5563" },
};

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#DB2777", "#059669", "#EA580C", "#0891B2", "#6D28D9"];

function colorFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ search, onSearch, currentUser }: {
  search: string;
  onSearch: (v: string) => void;
  currentUser: { name: string; initials: string } | null;
}) {
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
          placeholder="Search teammates..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
        />
      </div>
      <div className="flex-1" />
      {currentUser && (
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
            {currentUser.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{currentUser.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvite, loading }: {
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => Promise<void>;
  loading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("Member");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address"); return; }
    setError("");
    await onInvite(email, role);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(17,24,39,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Invite teammate</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="teammate@company.com"
              autoFocus
              className="w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-100"
              style={{ borderColor: error ? "#EF4444" : "#E5E7EB" }}
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Member", "Admin"] as MemberRole[]).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className="rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    borderColor: role === r ? "#7C3AED" : "#E5E7EB",
                    background: role === r ? "#F5F3FF" : "#fff",
                    color: role === r ? "#7C3AED" : "#6B7280",
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full text-white font-semibold text-sm rounded-xl py-3 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            {loading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Sending invite...
              </>
            ) : "Send invite"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRowCard({ member, currentUserRole, onRoleChange, onRemove }: {
  member: MemberRow;
  currentUserRole: MemberRole | null;
  onRoleChange: (id: string, role: MemberRole) => void;
  onRemove: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roleStyle = ROLE_STYLES[member.role];
  const canManage = (currentUserRole === "Owner" || currentUserRole === "Admin") && member.role !== "Owner";
  const initials = initialsFrom(member.fullName);
  const color = colorFromEmail(member.email);

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all duration-150">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative"
        style={{ background: color }}>
        {initials}
        {member.status === "Invited" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="12 6 12 12 16 14" /></svg>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{member.fullName}</p>
          {member.status === "Invited" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#FEF3C7", color: "#B45309" }}>
              Pending invite
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>
      </div>

      <span className="text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0"
        style={{ background: roleStyle.bg, color: roleStyle.color }}>
        {member.role}
      </span>

      {canManage && (
        <div className="relative flex-shrink-0">
          <button onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 w-44">
                {(["Member", "Admin"] as MemberRole[]).filter((r) => r !== member.role).map((r) => (
                  <button key={r} onClick={() => { onRoleChange(member.id, r); setMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Make {r}
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => { onRemove(member.id); setMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-red-50 transition-colors"
                  style={{ color: "#DC2626" }}>
                  Remove from workspace
                </button>
              </div>
            </>
          )}
        </div>
      )}
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

// ─── Main Team Page ───────────────────────────────────────────────────────────

export default function TeamPage() {
  const { user, userDoc } = useAuth();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole | null>(null);

  const workspaceId = userDoc?.currentWorkspaceId ?? "";

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Real-time members listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;

    const q = query(
      collection(db, `workspaces/${workspaceId}/members`),
      orderBy("invitedAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: MemberRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as MemberDoc),
      }));
      setMembers(rows);

      // Find current user's role
      if (user) {
        const me = rows.find((m) => m.uid === user.uid);
        setCurrentUserRole(me?.role ?? null);
      }
    });

    return () => unsub();
  }, [workspaceId, user]);

  // ── Invite ─────────────────────────────────────────────────────────────────
  async function handleInvite(email: string, role: MemberRole) {
    if (!user || !workspaceId) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/email/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          workspaceId,
          invitedByUid: user.uid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send invite");
      setShowInviteModal(false);
      showToast(`Invite sent to ${email}`, "success");
    } catch (err: any) {
      showToast(err.message ?? "Failed to send invite", "error");
    } finally {
      setInviteLoading(false);
    }
  }

  // ── Role change ────────────────────────────────────────────────────────────
  async function handleRoleChange(memberId: string, newRole: MemberRole) {
    if (!user || !workspaceId) return;
    try {
      const res = await fetch("/api/team/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, newRole, workspaceId, callerUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");
      showToast("Role updated", "success");
    } catch (err: any) {
      showToast(err.message ?? "Failed to update role", "error");
    }
  }

  // ── Remove member ──────────────────────────────────────────────────────────
  async function handleRemove(memberId: string) {
    if (!user || !workspaceId) return;
    try {
      const res = await fetch("/api/team/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, workspaceId, callerUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove member");
      showToast("Member removed", "success");
    } catch (err: any) {
      showToast(err.message ?? "Failed to remove member", "error");
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    let result = members;
    if (activeFilter !== "All") result = result.filter((m) => m.role === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) =>
        m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [members, activeFilter, search]);

  const counts: Record<FilterTab, number> = {
    All: members.length,
    Owner: members.filter((m) => m.role === "Owner").length,
    Admin: members.filter((m) => m.role === "Admin").length,
    Member: members.filter((m) => m.role === "Member").length,
  };

  const activeCount = members.filter((m) => m.status === "Active").length;
  const invitedCount = members.filter((m) => m.status === "Invited").length;
  const canInvite = currentUserRole === "Owner" || currentUserRole === "Admin";

  const currentUserInfo = user
    ? { name: user.displayName ?? user.email ?? "You", initials: initialsFrom(user.displayName ?? user.email ?? "U") }
    : null;

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>

      <Sidebar activeId="team" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar search={search} onSearch={setSearch} currentUser={currentUserInfo} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Team
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {activeCount} active {activeCount === 1 ? "member" : "members"}
              {invitedCount > 0 && (
                <span className="text-amber-600"> · {invitedCount} pending invite{invitedCount > 1 ? "s" : ""}</span>
              )}
            </p>
          </div>
          {canInvite && (
            <button onClick={() => setShowInviteModal(true)}
              className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Invite teammate
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
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
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                    color: isActive ? "#fff" : "#9CA3AF",
                  }}>
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Members list */}
        <div className="space-y-2.5 pb-8">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              {search ? "No members match your search." : "No members yet."}
            </div>
          ) : (
            filteredMembers.map((m) => (
              <MemberRowCard
                key={m.id}
                member={m}
                currentUserRole={currentUserRole}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>
      </main>

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          loading={inviteLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}