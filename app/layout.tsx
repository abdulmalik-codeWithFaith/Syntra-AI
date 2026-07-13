import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Syntra AI — AI Meeting Assistant That Joins, Transcribes & Extracts Tasks",
    template: "%s | Syntra AI",
  },
  description:
    "Syntra AI automatically joins your Google Meet, Zoom, and Teams meetings, transcribes every word, extracts action items, decisions, and generates PDF reports — so your team never misses a thing.",
  keywords: [
    "AI meeting assistant",
    "AI meeting recorder",
    "automatic meeting transcription",
    "meeting task extraction",
    "meeting summary AI",
    "AI notetaker",
    "Google Meet AI assistant",
    "Zoom AI assistant",
    "Microsoft Teams AI",
    "meeting action items",
    "meeting decisions tracker",
    "AI meeting notes",
    "Syntra AI",
    "meeting bot",
    "meeting productivity tool",
    "automated meeting reports",
    "AI co-worker",
    "meeting transcription software",
  ],
  authors: [{ name: "Syntra AI", url: "https://syntraai.ai" }],
  creator: "Syntra AI",
  publisher: "Syntra AI",
  category: "Productivity",
  metadataBase: new URL("https://syntraai.ai"),
  alternates: {
    canonical: "https://syntraai.ai",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://syntraai.ai",
    siteName: "Syntra AI",
    title: "Syntra AI — AI Meeting Assistant That Joins, Transcribes & Extracts Tasks",
    description:
      "Syntra AI automatically joins your meetings, transcribes every word, extracts tasks and decisions, and generates PDF reports. Works with Google Meet, Zoom and Teams.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Syntra AI — AI Meeting Assistant",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@syntraai",
    creator: "@syntraai",
    title: "Syntra AI — AI Meeting Assistant That Joins, Transcribes & Extracts Tasks",
    description:
      "Syntra joins your meetings automatically, transcribes every word, extracts tasks and decisions, and generates PDF reports. Never take meeting notes again.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "add-your-google-search-console-verification-code-here",
  },
  applicationName: "Syntra AI",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

        {/* Favicon shown beside tab title */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* JSON-LD structured data — helps Google understand your product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Syntra AI",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://syntraai.ai",
              logo: "https://syntraai.ai/logo.png",
              description:
                "Syntra AI automatically joins your Google Meet, Zoom, and Teams meetings, transcribes every word, extracts action items and decisions, and generates PDF reports.",
              offers: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free forever — 3 AI meetings, summaries and task extraction",
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "19",
                  priceCurrency: "USD",
                  description: "20 AI meeting hours/month, calendar auto-join, email reminders",
                },
                {
                  "@type": "Offer",
                  name: "Team",
                  price: "49",
                  priceCurrency: "USD",
                  description: "75 AI meeting hours/month, shared dashboard, team analytics",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "128",
              },
              featureList: [
                "Automatic meeting joining",
                "Real-time transcription",
                "AI task extraction",
                "Decision tracking",
                "PDF report generation",
                "Google Meet integration",
                "Zoom integration",
                "Microsoft Teams integration",
                "Calendar auto-join",
              ],
            }),
          }}
        />

        {/* Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Syntra AI",
              url: "https://syntraai.ai",
              logo: "https://syntraai.ai/logo.png",
              sameAs: [
                "https://twitter.com/syntraai",
                "https://linkedin.com/company/syntraai",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}