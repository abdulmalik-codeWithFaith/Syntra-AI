"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  {
    section: "Main",
    items: [
      { href: "/admin", label: "Overview", icon: "ti-chart-bar" },
      { href: "/admin/workspaces", label: "Workspaces", icon: "ti-building" },
      { href: "/admin/users", label: "Users", icon: "ti-users" },
      { href: "/admin/meetings", label: "Meetings", icon: "ti-video" },
    ],
  },
  {
    section: "Revenue",
    items: [
      { href: "/admin/billing", label: "Billing", icon: "ti-credit-card" },
      { href: "/admin/mrr", label: "MRR", icon: "ti-trending-up" },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/admin/recall-usage", label: "Recall.ai usage", icon: "ti-microphone" },
      { href: "/admin/support", label: "Flags", icon: "ti-flag", badge: "3" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  async function handleSignOut() {
    await signOut(auth);
    router.push("/admin/login");
  }

  const initials = (user?.email ?? "SA").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-0)", fontFamily: "var(--font-sans)" }}>

      {/* Sidebar */}
      <aside style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--surface-1)", borderRight: "0.5px solid var(--border)" }}>

        {/* Brand */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "0.5px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--fill-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-layout-dashboard" style={{ color: "var(--on-accent)", fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Syntra AI</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 1 }}>Admin console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {NAV.map((group) => (
            <div key={group.section}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 8px 4px" }}>
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: "var(--radius)", fontSize: 13, color: isActive ? "var(--text-accent)" : "var(--text-secondary)", background: isActive ? "var(--bg-accent)" : "transparent", textDecoration: "none", marginBottom: 1, transition: "background .1s" }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 16, width: 17, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, background: "var(--bg-danger)", color: "var(--text-danger)", padding: "1px 6px", borderRadius: 10, fontWeight: 500 }}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 8px", borderTop: "0.5px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: "var(--radius)", cursor: "pointer" }}
            onClick={handleSignOut}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--fill-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "var(--on-accent)", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email ?? "admin"}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Super admin</div>
            </div>
            <i className="ti ti-logout" style={{ fontSize: 14, color: "var(--text-muted)" }} />
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface-0)" }}>
        {children}
      </main>
    </div>
  );
}