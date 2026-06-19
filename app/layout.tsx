import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Syntra AI — Your AI Meeting Co-Worker",
    template: "%s | Syntra AI",
  },
  description:
    "Syntra joins your meetings, listens to every word, and turns conversations into tasks, decisions, and reports — automatically.",
  keywords: [
    "AI meeting assistant",
    "meeting transcription",
    "task extraction",
    "meeting summary",
    "Syntra AI",
    "AI co-worker",
  ],
  authors: [{ name: "Syntra AI" }],
  creator: "Syntra AI",
  metadataBase: new URL("https://syntra.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://syntra.ai",
    siteName: "Syntra AI",
    title: "Syntra AI — Your AI Meeting Co-Worker",
    description:
      "Syntra joins your meetings, listens to every word, and turns conversations into tasks, decisions, and reports — automatically.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Syntra AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntra AI — Your AI Meeting Co-Worker",
    description:
      "Syntra joins your meetings and turns conversations into tasks, decisions, and reports — automatically.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ─── Theme color (browser chrome / mobile address bar) ─────────────────────────

export const viewport = {
  themeColor: "#7C3AED",
};

// ─── Layout ───────────────────────────────────────────────────────────────────

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Syne (display) + JetBrains Mono (code/labels) — brand typefaces used across all pages */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-white text-gray-900 antialiased min-h-screen"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}