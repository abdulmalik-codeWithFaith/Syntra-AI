import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/workspaces", label: "Workspaces", icon: "🏢" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/meetings", label: "Meetings", icon: "🗓️" },
  { href: "/admin/billing", label: "Billing", icon: "💳" },
  { href: "/admin/recall-usage", label: "Recall.ai Usage", icon: "🎙️" },
  { href: "/admin/support", label: "Support / Flags", icon: "🚩" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-5">
          <p className="text-sm font-semibold text-white">Admin Console</p>
          <p className="mt-0.5 text-xs text-slate-500">admin@yourapp.com</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
            ↩ Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}