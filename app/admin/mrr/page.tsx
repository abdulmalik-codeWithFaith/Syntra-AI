"use client";

import { useState, useMemo } from "react";

type PlanType = "pro" | "team";
type TrendDirection = "up" | "down" | "neutral";

interface MRRMonth {
  month: string;
  mrr: number;
  newMRR: number;
  churnedMRR: number;
  expansionMRR: number;
  subscribers: number;
}

interface ChurnedWorkspace {
  id: string;
  workspaceName: string;
  ownerName: string;
  ownerInitials: string;
  ownerColor: string;
  plan: PlanType;
  amount: number;
  churnedAt: string;
  reason: string;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#DB2777,#EA580C)",
  "linear-gradient(135deg,#059669,#0891B2)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#EA580C,#B45309)",
];

const MRR_HISTORY: MRRMonth[] = [
  { month: "Jan 2026", mrr: 12400, newMRR: 1200, churnedMRR: 380, expansionMRR: 210, subscribers: 312 },
  { month: "Feb 2026", mrr: 13230, newMRR: 1400, churnedMRR: 290, expansionMRR: 180, subscribers: 334 },
  { month: "Mar 2026", mrr: 14100, newMRR: 1600, churnedMRR: 310, expansionMRR: 220, subscribers: 358 },
  { month: "Apr 2026", mrr: 15280, newMRR: 1800, churnedMRR: 260, expansionMRR: 190, subscribers: 384 },
  { month: "May 2026", mrr: 16540, newMRR: 1900, churnedMRR: 240, expansionMRR: 240, subscribers: 412 },
  { month: "Jun 2026", mrr: 17700, newMRR: 1750, churnedMRR: 280, expansionMRR: 310, subscribers: 439 },
  { month: "Jul 2026", mrr: 18420, newMRR: 1620, churnedMRR: 190, expansionMRR: 280, subscribers: 452 },
];

const CHURNED: ChurnedWorkspace[] = [
  { id: "ws_ch1", workspaceName: "BrightPath Co", ownerName: "Lena Torres", ownerInitials: "LT", ownerColor: AVATAR_COLORS[0], plan: "pro", amount: 19, churnedAt: "Jul 1, 2026", reason: "Too expensive" },
  { id: "ws_ch2", workspaceName: "SkyForge Labs", ownerName: "Mike Chen", ownerInitials: "MC", ownerColor: AVATAR_COLORS[1], plan: "team", amount: 49, churnedAt: "Jun 28, 2026", reason: "Switched product" },
  { id: "ws_ch3", workspaceName: "DriftWave Inc", ownerName: "Amy Park", ownerInitials: "AP", ownerColor: AVATAR_COLORS[2], plan: "pro", amount: 19, churnedAt: "Jun 20, 2026", reason: "No longer needed" },
];

const PLAN_STYLES: Record<PlanType, { bg: string; color: string; label: string }> = {
  pro:  { bg: "#EFF6FF", color: "#2563EB", label: "Pro" },
  team: { bg: "#F5F3FF", color: "#7C3AED", label: "Team" },
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, width: "100%" }}>
      <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 2, transition: "width .3s" }} />
    </div>
  );
}

function SparkBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, background: i === data.length - 1 ? color : `${color}55`, borderRadius: "2px 2px 0 0", height: `${Math.round((v / max) * 100)}%`, minHeight: 4, transition: "height .3s" }} />
      ))}
    </div>
  );
}

const TIME_FILTERS = ["3 months", "6 months", "All time"];

export default function AdminMRRPage() {
  const [activeTime, setActiveTime] = useState("All time");

  const visibleMonths = useMemo(() => {
    if (activeTime === "3 months") return MRR_HISTORY.slice(-3);
    if (activeTime === "6 months") return MRR_HISTORY.slice(-6);
    return MRR_HISTORY;
  }, [activeTime]);

  const current = MRR_HISTORY[MRR_HISTORY.length - 1];
  const prev = MRR_HISTORY[MRR_HISTORY.length - 2];
  const mrrGrowth = (((current.mrr - prev.mrr) / prev.mrr) * 100).toFixed(1);
  const maxMRR = Math.max(...visibleMonths.map((m) => m.mrr));

  const stats = [
    { label: "Current MRR", value: `$${current.mrr.toLocaleString()}`, sub: `+${mrrGrowth}% vs last month`, trend: "up" as TrendDirection, accent: true },
    { label: "New MRR", value: `$${current.newMRR.toLocaleString()}`, sub: "from new subscribers", trend: "up" as TrendDirection, icon: "ti-user-plus", iconBg: "#ECFDF5", iconColor: "#059669" },
    { label: "Churned MRR", value: `$${current.churnedMRR.toLocaleString()}`, sub: "lost this month", trend: "down" as TrendDirection, icon: "ti-user-minus", iconBg: "#FEF2F2", iconColor: "#DC2626" },
    { label: "Expansion MRR", value: `$${current.expansionMRR.toLocaleString()}`, sub: "from upgrades", trend: "up" as TrendDirection, icon: "ti-trending-up", iconBg: "#F5F3FF", iconColor: "#7C3AED" },
  ];

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>MRR</div>
        <div style={{ display: "flex", gap: 4 }}>
          {TIME_FILTERS.map((t) => (
            <button key={t} onClick={() => setActiveTime(t)}
              style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 8, border: "1px solid", borderColor: activeTime === t ? "transparent" : "#E5E7EB", color: activeTime === t ? "#fff" : "#6B7280", background: activeTime === t ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              {t}
            </button>
          ))}
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 34, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <i className="ti ti-download" style={{ fontSize: 14 }} />
          Export
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: s.accent ? "linear-gradient(135deg,#EFF6FF,#F5F3FF)" : "#fff", border: `1px solid ${s.accent ? "#DDD6FE" : "#F3F4F6"}`, borderRadius: 12, padding: "14px 16px", position: "relative" }}>
              {s.icon && (
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: s.iconColor }} />
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 600, color: s.accent ? "#7C3AED" : "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.accent ? "#4C1D95" : "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, color: s.trend === "up" ? "#059669" : s.trend === "down" ? "#DC2626" : "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* MRR Chart */}
        <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>MRR over time</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {[
                { label: "MRR", color: "#7C3AED" },
                { label: "New", color: "#059669" },
                { label: "Churned", color: "#DC2626" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: "inline-block" }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Chart bars */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160, position: "relative" }}>
            {/* Y axis labels */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", paddingBottom: 20 }}>
              {["$20k", "$15k", "$10k", "$5k", "$0"].map((l) => (
                <span key={l} style={{ fontSize: 10, color: "#D1D5DB", whiteSpace: "nowrap" }}>{l}</span>
              ))}
            </div>

            {/* Bars */}
            <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "flex-end", height: "100%", borderLeft: "0.5px solid #F3F4F6", borderBottom: "0.5px solid #F3F4F6", padding: "0 8px 0 8px" }}>
              {visibleMonths.map((m, i) => {
                const isLast = i === visibleMonths.length - 1;
                const mrrH = Math.round((m.mrr / 20000) * 130);
                const newH = Math.round((m.newMRR / 20000) * 130);
                const churnH = Math.round((m.churnedMRR / 20000) * 130);
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 130 }}>
                      <div style={{ flex: 1, background: isLast ? "#7C3AED" : "#EDE9FE", borderRadius: "3px 3px 0 0", height: mrrH, transition: "height .3s" }} />
                      <div style={{ flex: 1, background: isLast ? "#059669" : "#D1FAE5", borderRadius: "3px 3px 0 0", height: newH, transition: "height .3s" }} />
                      <div style={{ flex: 1, background: isLast ? "#DC2626" : "#FEE2E2", borderRadius: "3px 3px 0 0", height: churnH, transition: "height .3s" }} />
                    </div>
                    <div style={{ fontSize: 9, color: isLast ? "#7C3AED" : "#9CA3AF", fontWeight: isLast ? 700 : 400, textAlign: "center", marginTop: 4 }}>
                      {m.month.split(" ")[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Monthly breakdown table */}
          <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Monthly breakdown</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Month", "MRR", "New", "Churned", "Subs"].map((h) => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", padding: "6px 8px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...visibleMonths].reverse().map((m, i) => {
                  const isLatest = i === 0;
                  return (
                    <tr key={m.month} style={{ borderTop: "1px solid #F9FAFB" }}>
                      <td style={{ padding: "8px", fontSize: 12, fontWeight: isLatest ? 600 : 400, color: isLatest ? "#111827" : "#6B7280" }}>{m.month}</td>
                      <td style={{ padding: "8px", fontSize: 12, fontWeight: 700, color: isLatest ? "#7C3AED" : "#111827" }}>${m.mrr.toLocaleString()}</td>
                      <td style={{ padding: "8px", fontSize: 12, color: "#059669", fontWeight: 500 }}>+${m.newMRR.toLocaleString()}</td>
                      <td style={{ padding: "8px", fontSize: 12, color: "#DC2626", fontWeight: 500 }}>-${m.churnedMRR.toLocaleString()}</td>
                      <td style={{ padding: "8px", fontSize: 12, color: "#6B7280" }}>{m.subscribers}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent churn */}
          <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Recent churn</div>
              <span style={{ fontSize: 11, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 6 }}>
                {CHURNED.length} this month
              </span>
            </div>
            {CHURNED.map((c, i) => {
              const plan = PLAN_STYLES[c.plan];
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.ownerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {c.ownerInitials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.workspaceName}</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", flexShrink: 0 }}>-${c.amount}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20, background: plan.bg, color: plan.color }}>{plan.label}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{c.churnedAt}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>·</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{c.reason}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Plan revenue split */}
            <div style={{ marginTop: 16, padding: "14px 0 0", borderTop: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Revenue by plan</div>
              {[
                { label: "Team ($49)", count: 62, color: "#7C3AED", revenue: 62 * 49 },
                { label: "Pro ($19)", count: 180, color: "#2563EB", revenue: 180 * 19 },
              ].map((p) => (
                <div key={p.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>{p.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>${p.revenue.toLocaleString()}</span>
                  </div>
                  <MiniBar value={p.revenue} max={180 * 49} color={p.color} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}