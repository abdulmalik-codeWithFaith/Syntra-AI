"use client";

import { useState } from "react";

const STATS = [
  { label: "Workspaces", value: "482", sub: "↑ 12 this week", trend: "up", icon: "ti-building", iconBg: "#EFF6FF", iconColor: "#2563EB" },
  { label: "Total users", value: "1,904", sub: "↑ 47 this week", trend: "up", icon: "ti-users", iconBg: "#ECFDF5", iconColor: "#059669" },
  { label: "Meetings processed", value: "15,230", sub: "+230 today", trend: "neutral", icon: "ti-video", iconBg: "#FEF3C7", iconColor: "#B45309" },
  { label: "MRR", value: "$18,420", sub: "+4.2% vs last month", trend: "up", accent: true },
  { label: "PDFs generated", value: "9,871", sub: "+104 today", trend: "neutral", icon: "ti-file-type-pdf", iconBg: "#F5F3FF", iconColor: "#7C3AED" },
  { label: "Tasks extracted", value: "26,410", sub: "+312 today", trend: "neutral", icon: "ti-checkbox", iconBg: "#ECFDF5", iconColor: "#059669" },
  { label: "Active subs", value: "452", sub: "↓ 2 churned", trend: "down", icon: "ti-credit-card", iconBg: "#EFF6FF", iconColor: "#2563EB" },
  { label: "Bot minutes used", value: "8,340", sub: "this month", trend: "neutral", icon: "ti-microphone", iconBg: "#FEF3C7", iconColor: "#B45309" },
];

const PLANS = [
  { name: "Starter", count: 210, pct: "46%", color: "#9CA3AF" },
  { name: "Pro", count: 180, pct: "40%", color: "#2563EB" },
  { name: "Team", count: 62, pct: "14%", color: "#7C3AED" },
];

const ACTIVITY = [
  { icon: "ti-building", bg: "#ECFDF5", color: "#059669", text: <><strong>Growthly Inc</strong> joined on Pro</>, time: "2 min ago" },
  { icon: "ti-user-plus", bg: "#EFF6FF", color: "#2563EB", text: <>48 new users signed up today</>, time: "ongoing" },
  { icon: "ti-flag", bg: "#FEF2F2", color: "#DC2626", text: <>3 tasks flagged — no owner assigned</>, time: "14 min ago" },
  { icon: "ti-credit-card", bg: "#FEF3C7", color: "#B45309", text: <>Payment failed for <strong>MoonLab</strong></>, time: "1 hr ago" },
];

const TIME_FILTERS = ["Today", "7 days", "30 days", "All time"];

export default function AdminOverviewPage() {
  const [activeTime, setActiveTime] = useState("Today");

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#ffffff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>Overview</div>
        <div style={{ display: "flex", gap: 4 }}>
          {TIME_FILTERS.map((t) => (
            <button key={t} onClick={() => setActiveTime(t)}
              style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 8, border: "1px solid", borderColor: activeTime === t ? "transparent" : "#E5E7EB", color: activeTime === t ? "#fff" : "#6B7280", background: activeTime === t ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: s.accent ? "linear-gradient(135deg, #EFF6FF, #F5F3FF)" : "#ffffff", border: `1px solid ${s.accent ? "#DDD6FE" : "#F3F4F6"}`, borderRadius: 14, padding: "16px", position: "relative" }}>
              {s.icon && (
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: s.iconColor }} />
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 600, color: s.accent ? "#7C3AED" : "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.accent ? "#4C1D95" : "#111827", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 5, color: s.trend === "up" ? "#059669" : s.trend === "down" ? "#DC2626" : s.accent ? "#7C3AED" : "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Plans */}
          <div style={{ background: "#ffffff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Subscriptions by plan</div>
            {PLANS.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < PLANS.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#6B7280", flex: "0 0 52px" }}>{p.name}</span>
                <div style={{ flex: 1, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
                  <div style={{ height: 5, width: p.pct, background: p.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", minWidth: 32, textAlign: "right" }}>{p.count}</span>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div style={{ background: "#ffffff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Recent activity</div>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <i className={`ti ${a.icon}`} style={{ fontSize: 14, color: a.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}