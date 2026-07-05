"use client";

import { useState } from "react";

const STATS = [
  { label: "Workspaces", value: "482", sub: "↑ 12 this week", trend: "up", icon: "ti-building", iconBg: "var(--bg-accent)", iconColor: "var(--text-accent)" },
  { label: "Total users", value: "1,904", sub: "↑ 47 this week", trend: "up", icon: "ti-users", iconBg: "var(--bg-success)", iconColor: "var(--text-success)" },
  { label: "Meetings processed", value: "15,230", sub: "+230 today", trend: "neutral", icon: "ti-video", iconBg: "var(--bg-warning)", iconColor: "var(--text-warning)" },
  { label: "MRR", value: "$18,420", sub: "+4.2% vs last month", trend: "up", accent: true },
  { label: "PDFs generated", value: "9,871", sub: "+104 today", trend: "neutral", icon: "ti-file-type-pdf", iconBg: "var(--bg-pro)", iconColor: "var(--text-pro)" },
  { label: "Tasks extracted", value: "26,410", sub: "+312 today", trend: "neutral", icon: "ti-checkbox", iconBg: "var(--bg-success)", iconColor: "var(--text-success)" },
  { label: "Active subs", value: "452", sub: "↓ 2 churned", trend: "down", icon: "ti-credit-card", iconBg: "var(--bg-accent)", iconColor: "var(--text-accent)" },
  { label: "Bot minutes used", value: "8,340", sub: "this month", trend: "neutral", icon: "ti-microphone", iconBg: "var(--bg-warning)", iconColor: "var(--text-warning)" },
];

const PLANS = [
  { name: "Starter", count: 210, pct: "46%", color: "var(--text-muted)" },
  { name: "Pro", count: 180, pct: "40%", color: "var(--fill-accent)" },
  { name: "Team", count: 62, pct: "14%", color: "var(--fill-pro)" },
];

const ACTIVITY = [
  { icon: "ti-building", bg: "var(--bg-success)", color: "var(--text-success)", text: <>New workspace <strong>Growthly Inc</strong> joined on Pro</>, time: "2 min ago" },
  { icon: "ti-user-plus", bg: "var(--bg-accent)", color: "var(--text-accent)", text: <>48 new users signed up today</>, time: "ongoing" },
  { icon: "ti-flag", bg: "var(--bg-danger)", color: "var(--text-danger)", text: <>3 tasks flagged — no owner assigned</>, time: "14 min ago" },
  { icon: "ti-credit-card", bg: "var(--bg-warning)", color: "var(--text-warning)", text: <>Payment failed for <strong>MoonLab</strong></>, time: "1 hr ago" },
];

const TIME_FILTERS = ["Today", "7 days", "30 days", "All time"];

export default function AdminOverviewPage() {
  const [activeTime, setActiveTime] = useState("Today");

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>Overview</div>
        <div style={{ display: "flex", gap: 4 }}>
          {TIME_FILTERS.map((t) => (
            <button key={t} onClick={() => setActiveTime(t)}
              style={{ fontSize: 11, padding: "3px 9px", borderRadius: "var(--radius)", border: "0.5px solid", borderColor: activeTime === t ? "var(--border-accent)" : "var(--border)", color: activeTime === t ? "var(--text-accent)" : "var(--text-secondary)", background: activeTime === t ? "var(--bg-accent)" : "var(--surface-2)", cursor: "pointer", fontFamily: "inherit" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: s.accent ? "var(--bg-accent)" : "var(--surface-1)", border: "0.5px solid", borderColor: s.accent ? "var(--border-accent)" : "var(--border)", borderRadius: 12, padding: "14px 16px", position: "relative" }}>
              {s.icon && (
                <div style={{ position: "absolute", right: 14, top: 14, width: 28, height: 28, borderRadius: 6, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: 15, color: s.iconColor }} />
                </div>
              )}
              <div style={{ fontSize: 11, color: s.accent ? "var(--text-accent)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8, opacity: s.accent ? 0.7 : 1 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: s.accent ? "var(--text-accent)" : "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, marginTop: 5, color: s.trend === "up" ? "var(--text-success)" : s.trend === "down" ? "var(--text-danger)" : s.accent ? "var(--text-accent)" : "var(--text-muted)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Plans */}
          <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 14 }}>Subscriptions by plan</div>
            {PLANS.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < PLANS.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{p.name}</span>
                <div style={{ flex: 2, height: 4, background: "var(--surface-0)", borderRadius: 2 }}>
                  <div style={{ height: 4, width: p.pct, background: p.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", minWidth: 28, textAlign: "right" }}>{p.count}</span>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 14 }}>Recent activity</div>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < ACTIVITY.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <i className={`ti ${a.icon}`} style={{ fontSize: 14, color: a.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.45 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}