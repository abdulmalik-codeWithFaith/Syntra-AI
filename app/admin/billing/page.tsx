"use client";

import { useState, useMemo } from "react";

type PlanType = "starter" | "pro" | "team";
type PaymentStatus = "paid" | "failed" | "refunded" | "pending";

interface Invoice {
  id: string;
  workspaceName: string;
  workspaceId: string;
  ownerName: string;
  ownerEmail: string;
  ownerInitials: string;
  ownerColor: string;
  plan: PlanType;
  amount: number;
  status: PaymentStatus;
  date: string;
  nextBilling: string;
  stripeId: string;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#DB2777,#EA580C)",
  "linear-gradient(135deg,#059669,#0891B2)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#EA580C,#B45309)",
];

const PLAN_STYLES: Record<PlanType, { bg: string; color: string; label: string; price: number }> = {
  starter: { bg: "#F3F4F6", color: "#6B7280", label: "Starter", price: 0 },
  pro:     { bg: "#EFF6FF", color: "#2563EB", label: "Pro", price: 19 },
  team:    { bg: "#F5F3FF", color: "#7C3AED", label: "Team", price: 49 },
};

const STATUS_STYLES: Record<PaymentStatus, { bg: string; color: string; dot: string; label: string }> = {
  paid:     { bg: "#ECFDF5", color: "#059669", dot: "#10B981", label: "Paid" },
  failed:   { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", label: "Failed" },
  refunded: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF", label: "Refunded" },
  pending:  { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B", label: "Pending" },
};

const MOCK: Invoice[] = [
  { id: "inv_a1b2c3", workspaceName: "Growthly Inc", workspaceId: "ws_k2m9p", ownerName: "James Carter", ownerEmail: "james@growthly.io", ownerInitials: "JC", ownerColor: AVATAR_COLORS[0], plan: "team", amount: 49, status: "paid", date: "Jul 1, 2026", nextBilling: "Aug 1, 2026", stripeId: "sub_1Abc123" },
  { id: "inv_d4e5f6", workspaceName: "DesignBase Studio", workspaceId: "ws_n7r3x", ownerName: "Sofia Reyes", ownerEmail: "sofia@designbase.co", ownerInitials: "SR", ownerColor: AVATAR_COLORS[1], plan: "pro", amount: 19, status: "paid", date: "Jul 1, 2026", nextBilling: "Aug 1, 2026", stripeId: "sub_2Def456" },
  { id: "inv_g7h8i9", workspaceName: "MoonLab Technologies", workspaceId: "ws_p4t8q", ownerName: "Alex Morgan", ownerEmail: "alex@moonlab.tech", ownerInitials: "AM", ownerColor: AVATAR_COLORS[2], plan: "pro", amount: 19, status: "failed", date: "Jul 1, 2026", nextBilling: "Jul 8, 2026", stripeId: "sub_3Ghi789" },
  { id: "inv_j0k1l2", workspaceName: "NexGen Ventures", workspaceId: "ws_q9j2w", ownerName: "Tom Nakamura", ownerEmail: "tom@nexgen.vc", ownerInitials: "TN", ownerColor: AVATAR_COLORS[4], plan: "team", amount: 49, status: "paid", date: "Jun 1, 2026", nextBilling: "Jul 1, 2026", stripeId: "sub_4Jkl012" },
  { id: "inv_m3n4o5", workspaceName: "Arcadia Systems", workspaceId: "ws_b3n1c", ownerName: "Kim Lee", ownerEmail: "kim@arcadia.io", ownerInitials: "KL", ownerColor: AVATAR_COLORS[0], plan: "pro", amount: 19, status: "paid", date: "Jun 1, 2026", nextBilling: "Jul 1, 2026", stripeId: "sub_5Mno345" },
  { id: "inv_p6q7r8", workspaceName: "Summit AI", workspaceId: "ws_v5w6x", ownerName: "Dana Scott", ownerEmail: "dana@summit.ai", ownerInitials: "DS", ownerColor: AVATAR_COLORS[2], plan: "team", amount: 49, status: "paid", date: "Jun 1, 2026", nextBilling: "Jul 1, 2026", stripeId: "sub_6Pqr678" },
  { id: "inv_s9t0u1", workspaceName: "Folio Labs", workspaceId: "ws_x1k6m", ownerName: "Priya Rao", ownerEmail: "priya@foliolabs.com", ownerInitials: "PR", ownerColor: AVATAR_COLORS[3], plan: "starter", amount: 0, status: "pending", date: "—", nextBilling: "—", stripeId: "—" },
  { id: "inv_v2w3x4", workspaceName: "Pulse Creative", workspaceId: "ws_m7d4e", ownerName: "Sam Rivera", ownerEmail: "sam@pulsecreative.co", ownerInitials: "SR", ownerColor: AVATAR_COLORS[1], plan: "pro", amount: 19, status: "refunded", date: "Jun 15, 2026", nextBilling: "—", stripeId: "sub_7Vwx234" },
];

type FilterTab = "all" | PaymentStatus;
const PAGE_SIZE = 8;

export default function AdminBillingPage() {
  const [invoices] = useState<Invoice[]>(MOCK);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterTab>("all");
  const [planFilter, setPlanFilter] = useState<"all" | PlanType>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = invoices;
    if (statusFilter !== "all") r = r.filter((i) => i.status === statusFilter);
    if (planFilter !== "all") r = r.filter((i) => i.plan === planFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((i) =>
        i.workspaceName.toLowerCase().includes(q) ||
        i.ownerName.toLowerCase().includes(q) ||
        i.ownerEmail.toLowerCase().includes(q) ||
        i.stripeId.toLowerCase().includes(q)
      );
    }
    return r;
  }, [invoices, statusFilter, planFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    failed: invoices.filter((i) => i.status === "failed").length,
    refunded: invoices.filter((i) => i.status === "refunded").length,
    pending: invoices.filter((i) => i.status === "pending").length,
  };

  const mrr = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);

  const stats = [
    { label: "MRR", value: `$${mrr.toLocaleString()}`, sub: "+4.2% vs last month", trend: "up", icon: "ti-trending-up", iconBg: "linear-gradient(135deg,#EFF6FF,#F5F3FF)", iconColor: "#7C3AED", accent: true },
    { label: "Paying workspaces", value: invoices.filter((i) => i.plan !== "starter").length, sub: "Pro + Team plans", trend: "up", icon: "ti-credit-card", iconBg: "#EFF6FF", iconColor: "#2563EB" },
    { label: "Failed payments", value: invoices.filter((i) => i.status === "failed").length, sub: "needs attention", trend: "down", icon: "ti-alert-circle", iconBg: "#FEF2F2", iconColor: "#DC2626" },
    { label: "Refunded", value: invoices.filter((i) => i.status === "refunded").length, sub: "this month", trend: "neutral", icon: "ti-arrow-back-up", iconBg: "#F3F4F6", iconColor: "#6B7280" },
  ];

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>Billing</div>
        <div style={{ position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF", pointerEvents: "none" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by workspace, email..."
            style={{ height: 34, width: 240, padding: "0 12px 0 32px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#FAFAFB", fontFamily: "inherit" }} />
        </div>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value as any); setPage(1); }}
          style={{ height: 34, padding: "0 28px 0 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#fff", fontFamily: "inherit", cursor: "pointer" }}>
          <option value="all">All plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 34, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <i className="ti ti-download" style={{ fontSize: 14 }} />
          Export CSV
        </button>
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        {(["all", "paid", "failed", "pending", "refunded"] as const).map((f) => (
          <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
            style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: statusFilter === f ? "transparent" : "#E5E7EB", color: statusFilter === f ? "#fff" : "#6B7280", background: statusFilter === f ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: statusFilter === f ? "rgba(255,255,255,.2)" : "#F3F4F6", color: statusFilter === f ? "#fff" : "#9CA3AF", marginLeft: 4 }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: s.accent ? "linear-gradient(135deg,#EFF6FF,#F5F3FF)" : "#fff", border: `1px solid ${s.accent ? "#DDD6FE" : "#F3F4F6"}`, borderRadius: 12, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 10, background: typeof s.iconBg === "string" && s.iconBg.startsWith("linear") ? s.iconBg : s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: s.iconColor }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: s.accent ? "#7C3AED" : "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.accent ? "#4C1D95" : "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, color: s.trend === "up" ? "#059669" : s.trend === "down" ? "#DC2626" : "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                {["Workspace", "Plan", "Amount", "Invoice date", "Next billing", "Stripe ID", "Status", ""].map((h) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", padding: "10px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#9CA3AF", fontSize: 13 }}>No invoices found</td></tr>
              ) : paginated.map((inv) => {
                const plan = PLAN_STYLES[inv.plan];
                const status = STATUS_STYLES[inv.status];
                return (
                  <tr key={inv.id}
                    style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>

                    {/* Workspace */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: inv.ownerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {inv.ownerInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{inv.workspaceName}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{inv.ownerEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: plan.bg, color: plan.color }}>
                        {plan.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: inv.amount > 0 ? "#111827" : "#9CA3AF" }}>
                        {inv.amount > 0 ? `$${inv.amount}` : "Free"}
                      </span>
                      {inv.amount > 0 && <span style={{ fontSize: 11, color: "#9CA3AF" }}>/mo</span>}
                    </td>

                    {/* Invoice date */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>{inv.date}</td>

                    {/* Next billing */}
                    <td style={{ padding: 12, fontSize: 13, color: inv.status === "failed" ? "#DC2626" : "#6B7280", fontWeight: inv.status === "failed" ? 600 : 400 }}>
                      {inv.nextBilling}
                    </td>

                    {/* Stripe ID */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>{inv.stripeId}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      {[
                        { icon: "ti-eye", danger: false, title: "View invoice" },
                        { icon: "ti-refresh", danger: false, title: "Retry payment" },
                        { icon: "ti-arrow-back-up", danger: false, title: "Refund" },
                        { icon: "ti-ban", danger: true, title: "Cancel subscription" },
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} invoices
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