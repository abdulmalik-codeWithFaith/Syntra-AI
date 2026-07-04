"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "All" | "Product" | "AI" | "Remote Work" | "Productivity" | "Engineering";

interface Author {
  name: string;
  role: string;
  initials: string;
  gradient: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: Author;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  tags: string[];
  coverGradient: string;
  coverIcon: React.ReactNode;
}

// ─── Authors ──────────────────────────────────────────────────────────────────

const AUTHORS: Record<string, Author> = {
  abdulrosheed: {
    name: "Abdulrosheed Abdulmalik",
    role: "Founder & Developer",
    initials: "AA",
    gradient: "linear-gradient(135deg, #2563EB, #7C3AED)",
  },
  imran: {
    name: "Imran Musa",
    role: "CEO & Product Design",
    initials: "IM",
    gradient: "linear-gradient(135deg, #7C3AED, #DB2777)",
  },
};

// ─── Posts ────────────────────────────────────────────────────────────────────

const POSTS: BlogPost[] = [
  {
    id: "p1",
    slug: "why-every-meeting-needs-an-ai-co-worker",
    title: "Why every meeting needs an AI co-worker — not just a note-taker",
    excerpt: "Note-takers record. Co-workers think. Here's why the distinction matters for how your team works after meetings end.",
    category: "AI",
    author: AUTHORS.abdulrosheed,
    publishedAt: "June 28, 2026",
    readTime: 6,
    featured: true,
    tags: ["AI", "Meetings", "Productivity"],
    coverGradient: "linear-gradient(135deg, #1A1240, #2D1B6E)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a3 3 0 116 0v2" />
        <circle cx="9.5" cy="13.5" r="1" fill="white" /><circle cx="14.5" cy="13.5" r="1" fill="white" />
      </svg>
    ),
  },
  {
    id: "p2",
    slug: "how-we-built-syntra-in-6-months",
    title: "How we built Syntra AI in 6 months as a two-person team",
    excerpt: "The stack, the decisions, the tradeoffs, and everything we learned shipping a real-time AI meeting assistant from scratch.",
    category: "Engineering",
    author: AUTHORS.abdulrosheed,
    publishedAt: "June 25, 2026",
    readTime: 12,
    featured: true,
    tags: ["Engineering", "Firebase", "Next.js", "Gemini"],
    coverGradient: "linear-gradient(135deg, #064E3B, #065F46)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "p3",
    slug: "the-cost-of-a-bad-meeting",
    title: "The real cost of a bad meeting — and what you can do about it",
    excerpt: "Meetings without follow-through aren't just frustrating. They're expensive. We did the math on what it actually costs your team.",
    category: "Productivity",
    author: AUTHORS.imran,
    publishedAt: "June 22, 2026",
    readTime: 5,
    featured: false,
    tags: ["Productivity", "Meetings", "Remote Work"],
    coverGradient: "linear-gradient(135deg, #7C2D12, #9A3412)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-6" />
      </svg>
    ),
  },
  {
    id: "p4",
    slug: "gemini-vs-gpt-for-meeting-extraction",
    title: "Gemini vs GPT-4 for meeting extraction: what we found after 6 months",
    excerpt: "We tested both on thousands of meeting transcripts. The results surprised us. Here's what we learned and why we chose Gemini.",
    category: "AI",
    author: AUTHORS.abdulrosheed,
    publishedAt: "June 18, 2026",
    readTime: 9,
    featured: false,
    tags: ["AI", "Gemini", "LLMs", "Engineering"],
    coverGradient: "linear-gradient(135deg, #1E3A5F, #1E40AF)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "p5",
    slug: "remote-teams-meetings-accountability",
    title: "How remote teams can run fewer, better meetings with async accountability",
    excerpt: "The best remote teams don't run more meetings — they make each one count. Here's the framework we use internally at Syntra.",
    category: "Remote Work",
    author: AUTHORS.abdulrosheed,
    publishedAt: "June 14, 2026",
    readTime: 7,
    featured: false,
    tags: ["Remote Work", "Productivity", "Async"],
    coverGradient: "linear-gradient(135deg, #3B0764, #5B21B6)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    id: "p6",
    slug: "syntra-v1-product-launch",
    title: "Syntra AI v1.0: what we shipped and what comes next",
    excerpt: "A full breakdown of the v1 launch — what features made the cut, what we cut, what we're building next, and why.",
    category: "Product",
    author: AUTHORS.imran,
    publishedAt: "June 10, 2026",
    readTime: 8,
    featured: false,
    tags: ["Product", "Launch", "Roadmap"],
    coverGradient: "linear-gradient(135deg, #0C4A6E, #0369A1)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" />
      </svg>
    ),
  },
  {
    id: "p7",
    slug: "firebase-real-time-architecture",
    title: "Architecting real-time features with Firebase Firestore: lessons from Syntra",
    excerpt: "How we built Syntra's live transcript, task extraction stream, and multi-workspace system on Firestore — the good and the hard parts.",
    category: "Engineering",
    author: AUTHORS.abdulrosheed,
    publishedAt: "June 5, 2026",
    readTime: 11,
    featured: false,
    tags: ["Engineering", "Firebase", "Architecture"],
    coverGradient: "linear-gradient(135deg, #14532D, #166534)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    id: "p8",
    slug: "ai-task-extraction-how-it-works",
    title: "How Syntra extracts tasks from natural conversation — under the hood",
    excerpt: "Turning 'someone should probably handle the API audit before launch' into a structured task with owner and deadline is harder than it sounds.",
    category: "AI",
    author: AUTHORS.abdulrosheed,
    publishedAt: "May 30, 2026",
    readTime: 8,
    featured: false,
    tags: ["AI", "Engineering", "NLP"],
    coverGradient: "linear-gradient(135deg, #312E81, #4338CA)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: "p9",
    slug: "designing-syntra-dashboard",
    title: "Designing the Syntra dashboard: decisions, tradeoffs, and what we almost shipped",
    excerpt: "A behind-the-scenes look at how we designed the Syntra dashboard — the versions we killed, the components we rebuilt three times, and the design principles we ended up with.",
    category: "Product",
    author: AUTHORS.imran,
    publishedAt: "May 25, 2026",
    readTime: 10,
    featured: false,
    tags: ["Design", "Product", "UX"],
    coverGradient: "linear-gradient(135deg, #7C2D12, #C2410C)",
    coverIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

const CATEGORIES: Category[] = ["All", "Product", "AI", "Remote Work", "Productivity", "Engineering"];

const CATEGORY_COLORS: Record<Category, { bg: string; color: string }> = {
  All: { bg: "#F5F3FF", color: "#7C3AED" },
  Product: { bg: "#EFF6FF", color: "#2563EB" },
  AI: { bg: "#F5F3FF", color: "#7C3AED" },
  "Remote Work": { bg: "#ECFDF5", color: "#059669" },
  Productivity: { bg: "#FEF3C7", color: "#B45309" },
  Engineering: { bg: "#FEF2F2", color: "#DC2626" },
};

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogPost }) {
  const catStyle = CATEGORY_COLORS[post.category];
  return (
    <a href={`/blog/${post.slug}`}
      className="group rounded-3xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
      {/* Cover */}
      <div className="md:w-64 lg:w-80 flex-shrink-0 flex items-center justify-center py-12 md:py-0"
        style={{ background: post.coverGradient, minHeight: "200px" }}>
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          {post.coverIcon}
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-col justify-center p-7 flex-1">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: catStyle.bg, color: catStyle.color }}>
            {post.category}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#B45309" }}>
            Featured
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-violet-700 transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: post.author.gradient }}>
            {post.author.initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">{post.author.name}</p>
            <p className="text-[10px] text-gray-400">{post.publishedAt} · {post.readTime} min read</p>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPost }) {
  const catStyle = CATEGORY_COLORS[post.category];
  return (
    <a href={`/blog/${post.slug}`}
      className="group rounded-2xl overflow-hidden border border-gray-100 bg-white hover:border-violet-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Cover */}
      <div className="h-40 flex items-center justify-center flex-shrink-0"
        style={{ background: post.coverGradient }}>
        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
          {post.coverIcon}
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: catStyle.bg, color: catStyle.color }}>
            {post.category}
          </span>
          <span className="text-[9px] text-gray-400 font-mono">{post.readTime} min read</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug group-hover:text-violet-700 transition-colors flex-1"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          {post.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-2.5 mt-auto">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{ background: post.author.gradient }}>
            {post.author.initials}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-700 leading-none">{post.author.name}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{post.publishedAt}</p>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    // TODO: POST /api/email/newsletter { email }
    setDone(true);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-violet-100 p-7 text-center" style={{ background: "linear-gradient(135deg, #F5F3FF, #EFF6FF)" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
        Stay in the loop
      </h3>
      <p className="text-xs text-gray-500 mb-5 leading-relaxed">
        New posts every week on AI, meetings, product, and engineering. No spam.
      </p>
      {done ? (
        <p className="text-sm font-semibold" style={{ color: "#059669" }}>✓ You&apos;re subscribed!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 bg-white"
          />
          <button type="submit" disabled={loading}
            className="text-sm font-semibold text-white px-4 py-2.5 rounded-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featured = POSTS.filter((p) => p.featured);
  const rest = POSTS.filter((p) => !p.featured);

  const filtered = (activeCategory === "All" ? rest : rest.filter((p) => p.category === activeCategory))
    .filter((p) =>
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

  const counts: Record<Category, number> = {
    All: rest.length,
    Product: rest.filter((p) => p.category === "Product").length,
    AI: rest.filter((p) => p.category === "AI").length,
    "Remote Work": rest.filter((p) => p.category === "Remote Work").length,
    Productivity: rest.filter((p) => p.category === "Productivity").length,
    Engineering: rest.filter((p) => p.category === "Engineering").length,
  };

  return (
    <div style={{ background: "#FAFAFB", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        html { scroll-behavior: smooth; }
        nav.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={200} height={200} />
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "Blog", href: "/blog" },
              { label: "About", href: "/about" },
              { label: "Careers", href: "/careers" },
            ].map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: l.label === "Blog" ? "#7C3AED" : "#6B7280" }}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Log in</a>
            <a href="/signup" className="text-sm font-semibold text-white px-4 py-2 rounded-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="pt-28 pb-14 px-6 text-center border-b border-gray-200 bg-white">
        <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
          style={{ background: "#F5F3FF", color: "#7C3AED" }}>
          Blog
        </span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#111827" }}>
          Ideas, updates, and how-tos
        </h1>
        <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
          Writing on AI, meetings, product design, and building in public from the Syntra team.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mt-6 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-12 pb-20">
        <div className="flex gap-10 items-start">

          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Featured */}
            {search === "" && activeCategory === "All" && (
              <div className="mb-10">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Featured</p>
                <div className="space-y-4">
                  {featured.map((post) => (
                    <FeaturedCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150"
                    style={{
                      background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                      color: isActive ? "#fff" : "#6B7280",
                      border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                    }}
                  >
                    {cat}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                        color: isActive ? "#fff" : "#9CA3AF",
                      }}>
                      {counts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm font-semibold text-gray-900 mb-1">No posts found</p>
                <p className="text-xs text-gray-400">Try a different search or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-5 sticky top-24">
            <Newsletter />

            {/* Tags */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Popular tags</p>
              <div className="flex flex-wrap gap-2">
                {["AI", "Meetings", "Firebase", "Next.js", "Gemini", "Remote Work", "Productivity", "Engineering", "Design", "Product", "Launch"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(tag)}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Authors */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Authors</p>
              <div className="space-y-3">
                {Object.values(AUTHORS).map((author) => (
                  <div key={author.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ background: author.gradient }}>
                      {author.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{author.name}</p>
                      <p className="text-[9px] text-gray-400">{author.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={200} height={200} />
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Contact", href: "/contact" },
              { label: "Careers", href: "/careers" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}