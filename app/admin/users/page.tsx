"use client";

import { useState, useMemo } from "react";

type UserPlan = "starter" | "pro" | "team";
type UserStatus = "active" | "suspended" | "unverified";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  color: string;
  plan: UserPlan;
  workspaceCount: number;
  workspaceName: string;
  meetingCount: number;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  isAdmin?: boolean;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#DB2777,#EA580C)",
  "linear-gradient(135deg,#059669,#0891B2)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#EA580C,#B45309)",
];

const PLAN_STYLES: Record<UserPlan, { bg: string; color: string; label: string }> = {
  starter: { bg: "#F3F4F6", color: "#6B7280", label: "Starter" },
  pro:     { bg: "#EFF6FF", color: "#2563EB", label: "Pro" },
  team:    { bg: "#F5F3FF", color: "#7C3AED", label: "Team" },
};

const STATUS_STYLES: Record<UserStatus, { dot: string; color: string; label: string }> = {
  active:     { dot: "#10B981", color: "#059669", label: "Active" },
  suspended:  { dot: "#EF4444", color: "#DC2626", label: "Suspended" },
  unverified: { dot: "#F59E0B", color: "#B45309", label: "Unverified" },
};

const MOCK: AdminUser[] = [
  { id: "uid_a1b2c", fullName: "James Carter", email: "james@growthly.io", initials: "JC", color: AVATAR_COLORS[0], plan: "team", workspaceCount: 2, workspaceName: "Growthly Inc", meetingCount: 248, status: "active", joinedAt: "Jun 1, 2026", lastActive: "2h ago" },
  { id: "uid_d3e4f", fullName: "Sofia Reyes", email: "sofia@designbase.co", initials: "SR", color: AVATAR_COLORS[1], plan: "pro", workspaceCount: 1, workspaceName: "DesignBase Studio", meetingCount: 91, status: "active", joinedAt: "May 18, 2026", lastActive: "1d ago" },
  { id: "uid_g5h6i", fullName: "Alex Morgan", email: "alex@moonlab.tech", initials: "AM", color: AVATAR_COLORS[2], plan: "pro", workspaceCount: 1, workspaceName: "MoonLab Technologies", meetingCount: 134, status: "suspended", joinedAt: "Apr 30, 2026", lastActive: "5d ago" },
  { id: "uid_j7k8l", fullName: "Priya Rao", email: "priya@foliolabs.com", initials: "PR", color: AVATAR_COLORS[3], plan: "starter", workspaceCount: 1, workspaceName: "Folio Labs", meetingCount: 18, status: "active", joinedAt: "Jun 14, 2026", lastActive: "3h ago" },
  { id: "uid_m9n0o", fullName: "Tom Nakamura", email: "tom@nexgen.vc", initials: "TN", color: AVATAR_COLORS[4], plan: "team", workspaceCount: 3, workspaceName: "NexGen Ventures", meetingCount: 412, status: "suspended", joinedAt: "Mar 10, 2026", lastActive: "12d ago" },
  { id: "uid_p1q2r", fullName: "Kim Lee", email: "kim@arcadia.io", initials: "KL", color: AVATAR_COLORS[0], plan: "pro", workspaceCount: 1, workspaceName: "Arcadia Systems", meetingCount: 207, status: "active", joinedAt: "Feb 22, 2026", lastActive: "1h ago" },
  { id: "uid_s3t4u", fullName: "Sam Rivera", email: "sam@pulsecreative.co", initials: "SR", color: AVATAR_COLORS[1], plan: "starter", workspaceCount: 1, workspaceName: "Pulse Creative", meetingCount: 31, status: "unverified", joinedAt: "Jun 20, 2026", lastActive: "Just now" },
  { id: "uid_v5w6x", fullName: "Dana Scott", email: "dana@summit.ai", initials: "DS", color: AVATAR_COLORS[2], plan: "team", workspaceCount: 2, workspaceName: "Summit AI", meetingCount: 189, status: "active", joinedAt: "Jan 15, 2026", lastActive: "30m ago", isAdmin: true },
];

const PAGE_SIZE = 8;

type FilterTab = "all" | UserPlan;

export default function AdminUsersPage() {
  const [users] = useState<AdminUser[]>(MOCK);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = users;
    if (planFilter !== "all") r = r.filter((u) => u.plan === planFilter);
    if (statusFilter !== "all") r = r.filter((u) => u.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.workspaceName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [users, planFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all: users.length,
    starter: users.filter((u) => u.plan === "starter").length,
    pro: users.filter((u) => u.plan === "pro").length,
    team: users.filter((u) => u.plan === "team").length,
  };

  const stats = [
    { label: "Total users", value: users.length, sub: "↑ 47 this week", trend: "up" },
    { label: "Active users", value: users.filter((u) => u.status === "active").length, sub: "↑ 12 today", trend: "up" },
    { label: "Suspended", value: users.filter((u) => u.status === "suspended").length, sub: "needs review", trend: "down" },
    { label: "Unverified", value: users.filter((u) => u.status === "unverified").length, sub: "pending email", trend: "neutral" },
  ];

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>Users</div>
        <div style={{ position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF", pointerEvents: "none" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            style={{ height: 34, width: 220, padding: "0 12px 0 32px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#FAFAFB", fontFamily: "inherit" }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 34, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} />
          Add user
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        {(["all", "starter", "pro", "team"] as const).map((f) => (
          <button key={f} onClick={() => { setPlanFilter(f); setPage(1); }}
            style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: planFilter === f ? "transparent" : "#E5E7EB", color: planFilter === f ? "#fff" : "#6B7280", background: planFilter === f ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: planFilter === f ? "rgba(255,255,255,.2)" : "#F3F4F6", color: planFilter === f ? "#fff" : "#9CA3AF", marginLeft: 4 }}>
              {counts[f]}
            </span>
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {(["all", "active", "suspended", "unverified"] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: statusFilter === s ? "transparent" : "#E5E7EB", color: statusFilter === s ? "#fff" : "#6B7280", background: statusFilter === s ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              {s === "all" ? "All status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, color: s.trend === "up" ? "#059669" : s.trend === "down" ? "#DC2626" : "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                {["User", "Workspace", "Plan", "Meetings", "Joined", "Last active", "Status", ""].map((h) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", padding: "10px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#9CA3AF", fontSize: 13 }}>No users found</td></tr>
              ) : paginated.map((u) => {
                const plan = PLAN_STYLES[u.plan];
                const status = STATUS_STYLES[u.status];
                return (
                  <tr key={u.id}
                    style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>

                    {/* User */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, position: "relative" }}>
                          {u.initials}
                          {u.isAdmin && (
                            <span style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: "#7C3AED", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <i className="ti ti-shield" style={{ fontSize: 7, color: "#fff" }} />
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: 5 }}>
                            {u.fullName}
                            {u.isAdmin && <span style={{ fontSize: 9, fontWeight: 700, background: "#F5F3FF", color: "#7C3AED", padding: "1px 5px", borderRadius: 4 }}>ADMIN</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Workspace */}
                    <td style={{ padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{u.workspaceName}</div>
                      {u.workspaceCount > 1 && (
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>+{u.workspaceCount - 1} more</div>
                      )}
                    </td>

                    {/* Plan */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: plan.bg, color: plan.color }}>
                        {plan.label}
                      </span>
                    </td>

                    {/* Meetings */}
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#111827" }}>{u.meetingCount}</td>

                    {/* Joined */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>{u.joinedAt}</td>

                    {/* Last active */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>{u.lastActive}</td>

                    {/* Status */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.dot, display: "inline-block", marginRight: 6 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: status.color }}>{status.label}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      {[
                        { icon: "ti-eye", danger: false, title: "View" },
                        { icon: "ti-edit", danger: false, title: "Edit" },
                        { icon: u.status === "suspended" ? "ti-lock-open" : "ti-lock", danger: false, title: u.status === "suspended" ? "Unsuspend" : "Suspend" },
                        { icon: "ti-trash", danger: true, title: "Delete" },
                      ].map((btn) => (
                        <button key={btn.icon} title={btn.title}
                          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 4 }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = btn.danger ? "#FEF2F2" : "#F9FAFB"; e.currentTarget.style.borderColor = btn.danger ? "#FECACA" : "#D1D5DB"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#E5E7EB"; }}>
                          <i className={`ti ${btn.icon}`} style={{ fontSize: 14, color: btn.danger ? "#DC2626" : "#6B7280" }} />
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
              <i className="ti ti-chevron-left" style={{ fontSize: 14 }} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 30, height: 30, borderRadius: 7, border: page === p ? "none" : "1px solid #E5E7EB", background: page === p ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", color: page === p ? "#fff" : "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages || totalPages === 0 ? 0.4 : 1 }}>
              <i className="ti ti-chevron-right" style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}