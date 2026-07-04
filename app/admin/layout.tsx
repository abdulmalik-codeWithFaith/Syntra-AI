import Link from "next/link";

const NAV = [
  { section: "Main", items: [
    { href: "/admin", label: "Overview", icon: "ti-chart-bar" },
    { href: "/admin/workspaces", label: "Workspaces", icon: "ti-building" },
    { href: "/admin/users", label: "Users", icon: "ti-users" },
    { href: "/admin/meetings", label: "Meetings", icon: "ti-video" },
  ]},
  { section: "Revenue", items: [
    { href: "/admin/billing", label: "Billing", icon: "ti-credit-card" },
    { href: "/admin/mrr", label: "MRR", icon: "ti-trending-up" },
  ]},
  { section: "System", items: [
    { href: "/admin/recall-usage", label: "Recall.ai usage", icon: "ti-microphone" },
    { href: "/admin/support", label: "Flags", icon: "ti-flag", badge: true },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-0)", fontFamily: "var(--font-sans)" }}>
      <aside style={{ width: 220, flexShrink: 0, background: "var(--surface-1)", borderRight: "0.5px solid var(--border)", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "0.5px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--fill-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-layout-dashboard" style={{ color: "var(--on-accent)", fontSize: 14 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Syntra</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 8, overflowY: "auto" }}>
          {NAV.map((section) => (
            <div key={section.section}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 8px 4px" }}>
                {section.section}
              </div>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 1 }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: 15, width: 16, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: 10, background: "var(--bg-danger)", color: "var(--text-danger)", padding: "1px 5px", borderRadius: 10 }}>3</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: 8, borderTop: "0.5px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: "var(--radius)", cursor: "pointer" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--fill-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "var(--on-accent)", flexShrink: 0 }}>SA</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>super@syntra.ai</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Super admin</div>
            </div>
            <i className="ti ti-logout" style={{ fontSize: 14, color: "var(--text-muted)" }} />
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
    </div>
  );
}