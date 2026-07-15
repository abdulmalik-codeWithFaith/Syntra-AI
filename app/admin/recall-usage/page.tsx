"use client";

import { useState, useMemo } from "react";

interface WorkspaceUsage {
  id: string;
  workspaceName: string;
  ownerName: string;
  ownerInitials: string;
  ownerColor: string;
  plan: "starter" | "pro" | "team";
  minutesUsed: number;
  quota: number;
  meetingCount: number;
  avgMeetingLength: number;
  costPerMinute: number;
  lastMeeting: string;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#DB2777,#EA580C)",
  "linear-gradient(135deg,#059669,#0891B2)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#EA580C,#B45309)",
];

const PLAN_STYLES = {
  starter: { bg: "#F3F4F6", color: "#6B7280", label: "Starter", quota: 300 },
  pro:     { bg: "#EFF6FF", color: "#2563EB", label: "Pro",     quota: 1200 },
  team:    { bg: "#F5F3FF", color: "#7C3AED", label: "Team",    quota: 4500 },
};

const MOCK: WorkspaceUsage[] = [
  { id: "ws_1", workspaceName: "Growthly Inc",         ownerName: "James Carter",  ownerInitials: "JC", ownerColor: AVATAR_COLORS[0], plan: "team",    minutesUsed: 3820, quota: 4500, meetingCount: 48,  avgMeetingLength: 62, costPerMinute: 0.015, lastMeeting: "2h ago" },
  { id: "ws_2", workspaceName: "DesignBase Studio",    ownerName: "Sofia Reyes",   ownerInitials: "SR", ownerColor: AVATAR_COLORS[1], plan: "pro",     minutesUsed: 1050, quota: 1200, meetingCount: 21,  avgMeetingLength: 45, costPerMinute: 0.015, lastMeeting: "1d ago" },
  { id: "ws_3", workspaceName: "MoonLab Technologies", ownerName: "Alex Morgan",   ownerInitials: "AM", ownerColor: AVATAR_COLORS[2], plan: "pro",     minutesUsed: 890,  quota: 1200, meetingCount: 18,  avgMeetingLength: 55, costPerMinute: 0.015, lastMeeting: "3d ago" },
  { id: "ws_4", workspaceName: "Folio Labs",           ownerName: "Priya Rao",     ownerInitials: "PR", ownerColor: AVATAR_COLORS[3], plan: "starter", minutesUsed: 240,  quota: 300,  meetingCount: 6,   avgMeetingLength: 38, costPerMinute: 0.015, lastMeeting: "5d ago" },
  { id: "ws_5", workspaceName: "NexGen Ventures",      ownerName: "Tom Nakamura",  ownerInitials: "TN", ownerColor: AVATAR_COLORS[4], plan: "team",    minutesUsed: 2100, quota: 4500, meetingCount: 31,  avgMeetingLength: 74, costPerMinute: 0.015, lastMeeting: "1h ago" },
  { id: "ws_6", workspaceName: "Arcadia Systems",      ownerName: "Kim Lee",       ownerInitials: "KL", ownerColor: AVATAR_COLORS[0], plan: "pro",     minutesUsed: 410,  quota: 1200, meetingCount: 9,   avgMeetingLength: 48, costPerMinute: 0.015, lastMeeting: "4d ago" },
  { id: "ws_7", workspaceName: "Summit AI",            ownerName: "Dana Scott",    ownerInitials: "DS", ownerColor: AVATAR_COLORS[2], plan: "team",    minutesUsed: 4100, quota: 4500, meetingCount: 62,  avgMeetingLength: 68, costPerMinute: 0.015, lastMeeting: "30m ago" },
];

const TIME_FILTERS = ["Today", "7 days", "30 days", "All time"];

function UsageBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#DC2626" : pct >= 75 ? "#B45309" : "#7C3AED";
  const bg    = pct >= 90 ? "#FEF2F2" : pct >= 75 ? "#FEF3C7" : "#F5F3FF";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3, minWidth: 80 }}>
        <div style={{ height: 6, width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "1px 6px", borderRadius: 6, minWidth: 36, textAlign: "center" }}>
        {pct}%
      </span>
    </div>
  );
}

export default function RecallUsagePage() {
  const [activeTime, setActiveTime] = useState("30 days");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"minutes" | "pct" | "cost">("pct");

  const totalMinutes  = MOCK.reduce((s, w) => s + w.minutesUsed, 0);
  const totalCost     = MOCK.reduce((s, w) => s + w.minutesUsed * w.costPerMinute, 0);
  const nearQuota     = MOCK.filter((w) => (w.minutesUsed / w.quota) >= 0.8).length;
  const totalMeetings = MOCK.reduce((s, w) => s + w.meetingCount, 0);

  const filtered = useMemo(() => {
    let r = [...MOCK];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((w) => w.workspaceName.toLowerCase().includes(q) || w.ownerName.toLowerCase().includes(q));
    }
    if (sortBy === "minutes") r.sort((a, b) => b.minutesUsed - a.minutesUsed);
    if (sortBy === "pct")     r.sort((a, b) => (b.minutesUsed / b.quota) - (a.minutesUsed / a.quota));
    if (sortBy === "cost")    r.sort((a, b) => (b.minutesUsed * b.costPerMinute) - (a.minutesUsed * a.costPerMinute));
    return r;
  }, [search, sortBy]);

  const stats = [
    { label: "Total bot minutes", value: totalMinutes.toLocaleString(), sub: "+230 this week", trend: "up", icon: "ti-clock", iconBg: "#EFF6FF", iconColor: "#2563EB" },
    { label: "Total cost (30d)", value: `$${totalCost.toFixed(2)}`, sub: "@ $0.015/min", trend: "neutral", icon: "ti-receipt", iconBg: "#F5F3FF", iconColor: "#7C3AED", accent: true },
    { label: "Near quota", value: nearQuota, sub: "≥ 80% usage", trend: "down", icon: "ti-alert-triangle", iconBg: "#FEF2F2", iconColor: "#DC2626" },
    { label: "Total meetings", value: totalMeetings, sub: "bot recordings", trend: "up", icon: "ti-microphone", iconBg: "#ECFDF5", iconColor: "#059669" },
  ];

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Recall.ai Usage</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Bot minutes, cost and quota tracking per workspace</div>
        </div>
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
              <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: s.iconColor }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: s.accent ? "#7C3AED" : "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.accent ? "#4C1D95" : "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, color: s.trend === "up" ? "#059669" : s.trend === "down" ? "#DC2626" : "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters + sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
            <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF", pointerEvents: "none" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              style={{ width: "100%", height: 34, padding: "0 12px 0 32px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#FAFAFB", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Sort by:</span>
            {[
              { key: "pct", label: "Usage %" },
              { key: "minutes", label: "Minutes" },
              { key: "cost", label: "Cost" },
            ].map((s) => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)}
                style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 8, border: "1px solid", borderColor: sortBy === s.key ? "transparent" : "#E5E7EB", color: sortBy === s.key ? "#fff" : "#6B7280", background: sortBy === s.key ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                {["Workspace", "Plan", "Minutes used", "Quota", "Usage", "Meetings", "Avg length", "Cost", "Last meeting"].map((h) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#9CA3AF", fontSize: 13 }}>No workspaces found</td></tr>
              ) : filtered.map((w) => {
                const pct  = Math.round((w.minutesUsed / w.quota) * 100);
                const cost = (w.minutesUsed * w.costPerMinute).toFixed(2);
                const plan = PLAN_STYLES[w.plan];
                const isWarning  = pct >= 75 && pct < 90;
                const isDanger   = pct >= 90;

                return (
                  <tr key={w.id}
                    style={{ borderBottom: "1px solid #F9FAFB", background: isDanger ? "#FFFBFB" : isWarning ? "#FFFDF5" : "#fff", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isDanger ? "#FFFBFB" : isWarning ? "#FFFDF5" : "#fff")}>

                    {/* Workspace */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: w.ownerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {w.ownerInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{w.workspaceName}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{w.ownerName}</div>
                        </div>
                        {isDanger && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "#FEE2E2", color: "#DC2626", padding: "1px 6px", borderRadius: 6, marginLeft: 4 }}>
                            QUOTA ALERT
                          </span>
                        )}
                        {isWarning && !isDanger && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF3C7", color: "#B45309", padding: "1px 6px", borderRadius: 6, marginLeft: 4 }}>
                            NEAR LIMIT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: plan.bg, color: plan.color }}>
                        {plan.label}
                      </span>
                    </td>

                    {/* Minutes used */}
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      {w.minutesUsed.toLocaleString()}
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400 }}> min</span>
                    </td>

                    {/* Quota */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>
                      {w.quota.toLocaleString()}
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}> min</span>
                    </td>

                    {/* Usage bar */}
                    <td style={{ padding: 12, minWidth: 160 }}>
                      <UsageBar pct={pct} />
                    </td>

                    {/* Meetings */}
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#111827" }}>
                      {w.meetingCount}
                    </td>

                    {/* Avg length */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>
                      {w.avgMeetingLength} min
                    </td>

                    {/* Cost */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>${cost}</span>
                    </td>

                    {/* Last meeting */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>
                      {w.lastMeeting}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Usage distribution */}
          <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Usage distribution</div>
            {filtered.map((w) => {
              const pct   = Math.round((w.minutesUsed / w.quota) * 100);
              const color = pct >= 90 ? "#DC2626" : pct >= 75 ? "#B45309" : "#7C3AED";
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: w.ownerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {w.ownerInitials}
                  </div>
                  <div style={{ fontSize: 12, color: "#374151", flex: "0 0 140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.workspaceName}</div>
                  <div style={{ flex: 1, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: "width .3s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Cost breakdown */}
          <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Cost breakdown</div>
            {[...filtered]
              .sort((a, b) => (b.minutesUsed * b.costPerMinute) - (a.minutesUsed * a.costPerMinute))
              .map((w, i) => {
                const cost    = w.minutesUsed * w.costPerMinute;
                const maxCost = Math.max(...MOCK.map((x) => x.minutesUsed * x.costPerMinute));
                const pct     = Math.round((cost / maxCost) * 100);
                return (
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", width: 16, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ fontSize: 12, color: "#374151", flex: "0 0 130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.workspaceName}</div>
                    <div style={{ flex: 1, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
                      <div style={{ height: 5, width: `${pct}%`, background: "linear-gradient(90deg,#7C3AED,#2563EB)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", minWidth: 44, textAlign: "right" }}>${cost.toFixed(2)}</span>
                  </div>
                );
              })}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Total cost (30d)</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}