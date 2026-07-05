"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", background: "#ffffff", borderRight: "1px solid #F3F4F6" }}>

        {/* Brand */}
        <div style={{ padding: "20px 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-layout-dashboard" style={{ color: "#fff", fontSize: 17 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "0.01em" }}>Syntra AI</div>
              <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 1 }}>Admin console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
          {NAV.map((group) => (
            <div key={group.section}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#D1D5DB", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 8px 4px" }}>
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: isActive ? "#fff" : "#6B7280", background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "transparent", textDecoration: "none", marginBottom: 1, transition: "all 0.12s" }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 16, width: 17, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />}
                    {item.badge && !isActive && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: "#FEE2E2", color: "#DC2626", padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: 10, borderTop: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, cursor: "pointer" }}
            onClick={handleSignOut}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email ?? "admin"}</div>
              <div style={{ fontSize: 10, color: "#9CA3AF" }}>Super admin</div>
            </div>
            <i className="ti ti-logout" style={{ fontSize: 14, color: "#9CA3AF" }} />
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#FAFAFB" }}>
        {children}
      </main>
    </div>
  );
}