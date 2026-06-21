"use client";

import Sidebar from "@/components/sidebar";
import { useState, useMemo, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────



type Role = "Owner" | "Admin" | "Member";
type MemberStatus = "Active" | "Invited";
type FilterTab = "All" | Role;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  initials: string;
  color: string;
  meetingsAttended: number;
  tasksOwned: number;
  joinedDate: string;
}



const INITIAL_MEMBERS: TeamMember[] = [
  { id: "m1", name: "Musa Imran", email: "musa@synthcorp.com", role: "Owner", status: "Active", initials: "MI", color: "#7C3AED", meetingsAttended: 25, tasksOwned: 4, joinedDate: "Jan 12, 2026" },
  { id: "m2", name: "Alexandra Deff", email: "alexandra@synthcorp.com", role: "Admin", status: "Active", initials: "AD", color: "#DB2777", meetingsAttended: 21, tasksOwned: 6, joinedDate: "Jan 14, 2026" },
  { id: "m3", name: "John Carter", email: "john@synthcorp.com", role: "Member", status: "Active", initials: "J", color: "#2563EB", meetingsAttended: 18, tasksOwned: 8, joinedDate: "Feb 2, 2026" },
  { id: "m4", name: "Sarah Kim", email: "sarah@synthcorp.com", role: "Member", status: "Active", initials: "S", color: "#DB2777", meetingsAttended: 16, tasksOwned: 5, joinedDate: "Feb 8, 2026" },
  { id: "m5", name: "Isaac Oluwatemilorun", email: "isaac@synthcorp.com", role: "Member", status: "Active", initials: "I", color: "#0891B2", meetingsAttended: 14, tasksOwned: 3, joinedDate: "Mar 1, 2026" },
  { id: "m6", name: "David Oshodi", email: "david@synthcorp.com", role: "Member", status: "Active", initials: "D", color: "#059669", meetingsAttended: 12, tasksOwned: 4, joinedDate: "Mar 15, 2026" },
  { id: "m7", name: "Priya Nair", email: "priya@synthcorp.com", role: "Member", status: "Invited", initials: "PN", color: "#EA580C", meetingsAttended: 0, tasksOwned: 0, joinedDate: "—" },
  { id: "m8", name: "James Okonkwo", email: "james@synthcorp.com", role: "Member", status: "Invited", initials: "JO", color: "#6D28D9", meetingsAttended: 0, tasksOwned: 0, joinedDate: "—" },
];

const FILTER_TABS: FilterTab[] = ["All", "Owner", "Admin", "Member"];

const ROLE_STYLES: Record<Role, { bg: string; color: string }> = {
  Owner: { bg: "#FCE7F3", color: "#9D174D" },
  Admin: { bg: "#DBEAFE", color: "#1E40AF" },
  Member: { bg: "#F3F4F6", color: "#4B5563" },
};



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
          placeholder="Search teammates..."
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

// ─── Invite modal ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: Role) => void }) {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<Role>("Member");
  const [error, setError] = useState<string>("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    onInvite(email, role);
    setEmail("");
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(17,24,39,0.4)" }} onClick={onClose}>
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
              className="w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2"
              style={{
                borderColor: error ? "#EF4444" : "#E5E7EB",
                boxShadow: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7C3AED"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#EF4444" : "#E5E7EB"; }}
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Member", "Admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    borderColor: role === r ? "#7C3AED" : "#E5E7EB",
                    background: role === r ? "#F5F3FF" : "#fff",
                    color: role === r ? "#7C3AED" : "#6B7280",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white font-semibold text-sm rounded-xl py-3 mt-2"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
          >
            Send invite
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Member row ─────────────────────────────────────────────────────────────────

function MemberRow({ member, onRoleChange, onRemove }: { member: TeamMember; onRoleChange: (id: string, role: Role) => void; onRemove: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roleStyle = ROLE_STYLES[member.role];

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all duration-150">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative" style={{ background: member.color }}>
        {member.initials}
        {member.status === "Invited" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="12 6 12 12 16 14" /></svg>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
          {member.status === "Invited" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#B45309" }}>
              Pending invite
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>
      </div>

      {member.status === "Active" && (
        <div className="hidden md:flex items-center gap-5 flex-shrink-0">
          <div className="text-center w-16">
            <p className="text-sm font-bold text-gray-900">{member.meetingsAttended}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Meetings</p>
          </div>
          <div className="text-center w-16">
            <p className="text-sm font-bold text-gray-900">{member.tasksOwned}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tasks</p>
          </div>
        </div>
      )}

      <span className="text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: roleStyle.bg, color: roleStyle.color }}>
        {member.role}
      </span>

      {member.role !== "Owner" && (
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 w-44">
                {member.status === "Invited" && (
                  <button className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Resend invite
                  </button>
                )}
                {(["Member", "Admin"] as Role[]).filter((r) => r !== member.role).map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(member.id, r); setMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Make {r}
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => { onRemove(member.id); setMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-red-50 transition-colors"
                  style={{ color: "#DC2626" }}
                >
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

// ─── Main Team Page ────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState<string>("");
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  function handleRoleChange(id: string, role: Role) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleInvite(email: string, role: Role) {
    const newMember: TeamMember = {
      id: `m${Date.now()}`,
      name: email.split("@")[0],
      email,
      role,
      status: "Invited",
      initials: email.slice(0, 2).toUpperCase(),
      color: ["#7C3AED", "#2563EB", "#DB2777", "#059669", "#EA580C"][Math.floor(Math.random() * 5)],
      meetingsAttended: 0,
      tasksOwned: 0,
      joinedDate: "—",
    };
    setMembers((prev) => [...prev, newMember]);
    setShowInviteModal(false);
    // TODO: trigger Nodemailer invite email via API route, then write to Firestore
  }

  const filteredMembers = useMemo(() => {
    let result = members;
    if (activeFilter !== "All") {
      result = result.filter((m) => m.role === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
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

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-outline-violet { border: 1.5px solid rgba(124, 58, 237, 0.3); color: #7C3AED; transition: all 0.15s ease; }
        .btn-outline-violet:hover { background: rgba(124, 58, 237, 0.06); border-color: #7C3AED; }
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="team" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar search={search} onSearch={setSearch} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Team
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {activeCount} active {activeCount === 1 ? "member" : "members"}
              {invitedCount > 0 && <span className="text-amber-600"> · {invitedCount} pending invite{invitedCount > 1 ? "s" : ""}</span>}
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Invite teammate
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                  color: isActive ? "#fff" : "#6B7280",
                  border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                }}
              >
                {tab}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                    color: isActive ? "#fff" : "#9CA3AF",
                  }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Members list */}
        <div className="space-y-2.5 pb-8">
          {filteredMembers.map((m) => (
            <MemberRow key={m.id} member={m} onRoleChange={handleRoleChange} onRemove={handleRemove} />
          ))}
        </div>
      </main>

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} onInvite={handleInvite} />
      )}
    </div>
  );
}