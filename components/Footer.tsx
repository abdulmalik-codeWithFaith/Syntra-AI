// components/Footer.tsx

import Link from "next/link";

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it Works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Teams", href: "/#team" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-10 md:flex-row">
          {/* Logo & Description */}
          <div className="max-w-xs">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #7C3AED)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>

              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Syntra AI
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400">
              Your AI meeting co-worker. Turns conversations into action.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.heading}>
                <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-gray-700">
                  {section.heading}
                </p>

                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-gray-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 md:flex-row">
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} Syntra AI. All rights reserved.
          </p>

          <div className="flex items-center gap-2 font-mono text-xs text-gray-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}