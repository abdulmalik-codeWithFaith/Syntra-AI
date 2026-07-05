"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";

type WorkspacePlan = "starter" | "pro" | "team";
type WorkspaceStatus = "active" | "suspended" | "past_due";

interface AdminWorkspace {
  id: string;
  workspaceName: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerInitials: string;
  ownerColor: string;
  plan: WorkspacePlan;
  memberCount: number;
  meetingCount: number;
  status: WorkspaceStatus;
  createdAt: string;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#DB2777,#EA580C)",
  "linear-gradient(135deg,#059669,#0891B2)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#EA580C,#B45309)",
];

function colorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsFrom(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PLAN_STYLES: Record<WorkspacePlan, { bg: string; color: string; label: string }> = {
  starter: { bg: "#F3F4F6", color: "#6B7280", label: "Starter" },
  pro:     { bg: "#EFF6FF", color: "#2563EB", label: "Pro" },
  team:    { bg: "#F5F3FF", color: "#7C3AED", label: "Team" },
};

const STATUS_STYLES: Record<WorkspaceStatus, { dot: string; color: string; label: string }> = {
  active:    { dot: "#10B981", color: "#059669", label: "Active" },
  past_due:  { dot: "#F59E0B", color: "#B45309", label: "Past due" },
  suspended: { dot: "#EF4444", color: "#DC2626", label: "Suspended" },
};

type FilterTab = "all" | WorkspacePlan;

// Mock data — replace with real Firestore fetch
const MOCK: AdminWorkspace[] = [
  { id: "ws_k2m9p", workspaceName: "Growthly Inc", companyName: "Growthly", ownerName: "James Carter", ownerEmail: "james@growthly.io", ownerInitials: "JC", ownerColor: AVATAR_COLORS[0], plan: "team", memberCount: 12, meetingCount: 248, status: "active", createdAt: "Jun 1, 2026" },
  { id: "ws_n7r3x", workspaceName: "DesignBase Studio", companyName: "DesignBase", ownerName: "Sofia Reyes", ownerEmail: "sofia@designbase.co", ownerInitials: "SR", ownerColor: AVATAR_COLORS[1], plan: "pro", memberCount: 4, meetingCount: 91, status: "active", createdAt: "May 18, 2026" },
  { id: "ws_p4t8q", workspaceName: "MoonLab Technologies", companyName: "MoonLab", ownerName: "Alex Morgan", ownerEmail: "alex@moonlab.tech", ownerInitials: "AM", ownerColor: AVATAR_COLORS[2], plan: "pro", memberCount: 7, meetingCount: 134, status: "past_due", createdAt: "Apr 30, 2026" },
  { id: "ws_x1k6m", workspaceName: "Folio Labs", companyName: "Folio", ownerName: "Priya Rao", ownerEmail: "priya@foliolabs.com", ownerInitials: "PR", ownerColor: AVATAR_COLORS[3], plan: "starter", memberCount: 1, meetingCount: 18, status: "active", createdAt: "Jun 14, 2026" },
  { id: "ws_q9j2w", workspaceName: "NexGen Ventures", companyName: "NexGen", ownerName: "Tom Nakamura", ownerEmail: "tom@nexgen.vc", ownerInitials: "TN", ownerColor: AVATAR_COLORS[4], plan: "team", memberCount: 21, meetingCount: 412, status: "suspended", createdAt: "Mar 10, 2026" },
  { id: "ws_b3n1c", workspaceName: "Arcadia Systems", companyName: "Arcadia", ownerName: "Kim Lee", ownerEmail: "kim@arcadia.io", ownerInitials: "KL", ownerColor: AVATAR_COLORS[0], plan: "pro", memberCount: 9, meetingCount: 207, status: "active", createdAt: "Feb 22, 2026" },
  { id: "ws_m7d4e", workspaceName: "Pulse Creative", companyName: "Pulse", ownerName: "Sam Rivera", ownerEmail: "sam@pulsecreative.co", ownerInitials: "SR", ownerColor: AVATAR_COLORS[1], plan: "starter", memberCount: 2, meetingCount: 31, status: "active", createdAt: "Jun 20, 2026" },
];

const PAGE_SIZE = 10;

export default function AdminWorkspacesPage() {
  const router = useRouter();
  const [workspaces] = useState<AdminWorkspace[]>(MOCK);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkspaceStatus>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = workspaces;
    if (planFilter !== "all") r = r.filter((w) => w.plan === planFilter);
    if (statusFilter !== "all") r = r.filter((w) => w.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((w) =>
        w.workspaceName.toLowerCase().includes(q) ||
        w.ownerName.toLowerCase().includes(q) ||
        w.ownerEmail.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
      );
    }
    return r;
  }, [workspaces, planFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all: workspaces.length,
    starter: workspaces.filter((w) => w.plan === "starter").length,
    pro: workspaces.filter((w) => w.plan === "pro").length,
    team: workspaces.filter((w) => w.plan === "team").length,
  };

  const stats = {
    total: workspaces.length,
    paying: workspaces.filter((w) => w.plan !== "starter").length,
    avgMembers: (workspaces.reduce((s, w) => s + w.memberCount, 0) / workspaces.length).toFixed(1),
    suspended: workspaces.filter((w) => w.status === "suspended").length,
  };

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>Workspaces</div>
        <div style={{ position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF", pointerEvents: "none" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search workspaces..."
            style={{ height: 34, width: 220, padding: "0 12px 0 32px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#FAFAFB", fontFamily: "inherit" }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 34, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} />
          Add workspace
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
          {(["all", "active", "past_due", "suspended"] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: statusFilter === s ? "transparent" : "#E5E7EB", color: statusFilter === s ? "#fff" : "#6B7280", background: statusFilter === s ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              {s === "all" ? "All status" : s === "past_due" ? "Past due" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total workspaces", value: stats.total, sub: "↑ 12 this week", trend: "up" },
            { label: "Paying workspaces", value: stats.paying, sub: "↑ 8 this week", trend: "up" },
            { label: "Avg members", value: stats.avgMembers, sub: "per workspace", trend: "neutral" },
            { label: "Suspended", value: stats.suspended, sub: "needs review", trend: "down" },
          ].map((s) => (
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
                {["Workspace", "Owner", "Plan", "Members", "Meetings", "Created", "Status", ""].map((h) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", padding: "10px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#9CA3AF", fontSize: 13 }}>No workspaces found</td></tr>
              ) : paginated.map((w) => {
                const plan = PLAN_STYLES[w.plan];
                const status = STATUS_STYLES[w.status];
                return (
                  <tr key={w.id} style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{w.workspaceName}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, fontFamily: "monospace" }}>{w.id}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: w.ownerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {w.ownerInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{w.ownerName}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{w.ownerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: plan.bg, color: plan.color }}>
                        {plan.label}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#111827" }}>{w.memberCount}</td>
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#111827" }}>{w.meetingCount}</td>
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>{w.createdAt}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.dot, display: "inline-block", marginRight: 6 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: status.color }}>{status.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      {[
                        { icon: "ti-eye", danger: false, title: "View" },
                        { icon: "ti-edit", danger: false, title: "Edit" },
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} workspaces
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
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}>
              <i className="ti ti-chevron-right" style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}