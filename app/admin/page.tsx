const stats = [
  { label: "Workspaces", value: "482", sub: "↑ 12 this week", trend: "up" },
  { label: "Total users", value: "1,904", sub: "↑ 47 this week", trend: "up" },
  { label: "Meetings processed", value: "15,230", sub: "+230 today", trend: "neutral" },
  { label: "MRR", value: "$18,420", sub: "+4.2% vs last month", trend: "up", accent: true },
  { label: "PDFs generated", value: "9,871", sub: "+104 today", trend: "neutral" },
  { label: "Tasks extracted", value: "26,410", sub: "+312 today", trend: "neutral" },
  { label: "Active subs", value: "452", sub: "↓ 2 churned", trend: "down" },
  { label: "Bot minutes used", value: "8,340", sub: "this month", trend: "neutral" },
];

const plans = [
  { name: "Starter", count: 210, pct: "46%", color: "var(--text-secondary)" },
  { name: "Pro", count: 180, pct: "40%", color: "var(--fill-accent)" },
  { name: "Team", count: 62, pct: "14%", color: "var(--fill-pro)" },
];

const activity = [
  { icon: "ti-building", color: "success", text: "New workspace Growthly Inc joined on Pro", time: "2 min ago" },
  { icon: "ti-user-plus", color: "accent", text: "48 new users signed up today", time: "ongoing" },
  { icon: "ti-flag", color: "danger", text: "3 tasks flagged with no owner", time: "14 min ago" },
  { icon: "ti-credit-card", color: "warning", text: "Payment failed for workspace MoonLab", time: "1 hr ago" },
];

export default function AdminOverviewPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>Overview</div>
        {["Today", "7 days", "30 days", "All time"].map((t, i) => (
          <div key={t} style={{ fontSize: 11, padding: "3px 8px", borderRadius: "var(--radius)", border: "0.5px solid var(--border)", color: i === 0 ? "var(--text-accent)" : "var(--text-secondary)", background: i === 0 ? "var(--bg-accent)" : "var(--surface-2)", cursor: "pointer" }}>
            {t}
          </div>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        
        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: s.accent ? "var(--bg-accent)" : "var(--surface-1)", border: `0.5px solid ${s.accent ? "var(--border-accent)" : "var(--border)"}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: s.accent ? "var(--text-accent)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: s.accent ? "var(--text-accent)" : "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: s.trend === "up" ? "var(--text-success)" : s.trend === "down" ? "var(--text-danger)" : "var(--text-muted)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Two panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          
          {/* Plans */}
          <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 12 }}>Subscriptions by plan</div>
            {plans.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
                    {p.name}
                  </div>
                  <div style={{ height: 4, width: 120, background: "var(--surface-0)", borderRadius: 2, marginTop: 4 }}>
                    <div style={{ height: 4, width: p.pct, background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{p.count}</div>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 12 }}>Recent activity</div>
            {activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < activity.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: `var(--bg-${a.color})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <i className={`ti ${a.icon}`} style={{ fontSize: 13, color: `var(--text-${a.color})` }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}