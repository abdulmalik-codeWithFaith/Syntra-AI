"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Department = "All" | "Engineering" | "AI & Research" | "Design" | "Product" | "Growth";
type Location = "Remote" | "Hybrid" | "On-site";
type JobType = "Full-time" | "Contract" | "Part-time";

interface Job {
  id: string;
  title: string;
  department: Department;
  location: Location;
  type: JobType;
  posted: string;
  description: string;
  requirements: string[];
  nice: string[];
}

interface Perk {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS: Department[] = ["All", "Engineering", "AI & Research", "Design", "Product", "Growth"];

const JOBS: Job[] = [
  {
    id: "j1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    posted: "2 days ago",
    description: "Build and scale the core Syntra AI platform. You'll work across the full stack — Next.js on the frontend, Firebase on the backend — and own features from idea to production.",
    requirements: [
      "5+ years of full-stack experience",
      "Strong proficiency in TypeScript and React",
      "Experience with Firebase (Auth, Firestore, Functions)",
      "Familiarity with real-time systems and WebSockets",
      "Track record of shipping production-grade features",
    ],
    nice: [
      "Experience with Next.js App Router",
      "Background in AI/ML product development",
      "Experience with audio processing or transcription systems",
    ],
  },
  {
    id: "j2",
    title: "AI / ML Engineer",
    department: "AI & Research",
    location: "Remote",
    type: "Full-time",
    posted: "3 days ago",
    description: "Own the intelligence layer of Syntra. You'll work with Gemini, fine-tune extraction pipelines, improve transcription accuracy, and build the voice interaction system that makes Syntra speak like a real co-worker.",
    requirements: [
      "3+ years working with LLMs or NLP systems",
      "Experience with Google Gemini, GPT-4, or similar models",
      "Strong Python skills and understanding of ML fundamentals",
      "Familiarity with speech-to-text and text-to-speech pipelines",
      "Ability to evaluate and iterate on model outputs",
    ],
    nice: [
      "Experience with speaker diarization",
      "Background in meeting intelligence or productivity AI",
      "Published research in NLP or speech recognition",
    ],
  },
  {
    id: "j3",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    posted: "5 days ago",
    description: "Design the experience that makes AI feel like a co-worker, not a tool. You'll own everything from user flows and component design to the visual language of the Syntra dashboard and meeting interface.",
    requirements: [
      "4+ years of product design experience",
      "Strong portfolio demonstrating SaaS or B2B product work",
      "Proficiency in Figma with strong systems thinking",
      "Experience designing for complex data-rich interfaces",
      "Comfort working directly with engineers in code",
    ],
    nice: [
      "Experience designing AI or voice-first products",
      "Background in productivity or collaboration tools",
      "Ability to write basic React/Tailwind for prototyping",
    ],
  },
  {
    id: "j4",
    title: "Backend Engineer — Infrastructure",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    posted: "1 week ago",
    description: "Build and maintain the infrastructure that powers Syntra's autonomous agent — the system that joins meetings, listens, and processes content without any manual intervention.",
    requirements: [
      "4+ years of backend engineering experience",
      "Deep understanding of event-driven architecture",
      "Experience with job queues, cron systems, and background workers",
      "Familiarity with cloud functions and serverless patterns (Firebase Functions, Vercel Edge)",
      "Strong debugging and observability skills",
    ],
    nice: [
      "Experience building bots or integrations for Zoom/Google Meet/Teams",
      "Background in audio or media processing pipelines",
      "Familiarity with WebRTC",
    ],
  },
  {
    id: "j5",
    title: "Product Manager",
    department: "Product",
    location: "Hybrid",
    type: "Full-time",
    posted: "1 week ago",
    description: "Own a core area of the Syntra product — from the meeting detail experience to the task dashboard and reporting. You'll work directly with engineers and designers to ship things people love.",
    requirements: [
      "3+ years of product management at a B2B SaaS company",
      "Strong written communication and prioritization skills",
      "Experience working in cross-functional teams with engineering and design",
      "Data-driven approach to product decisions",
      "Comfort with ambiguity and fast-moving environments",
    ],
    nice: [
      "Background in productivity, meeting, or HR tech",
      "Experience with AI product development",
      "Technical background or ability to read code",
    ],
  },
  {
    id: "j6",
    title: "Growth Engineer",
    department: "Growth",
    location: "Remote",
    type: "Full-time",
    posted: "2 weeks ago",
    description: "Own the growth systems that bring new users into Syntra — from onboarding flows and activation experiments to referral programs and lifecycle email. You'll work at the intersection of engineering and marketing.",
    requirements: [
      "3+ years of growth or full-stack engineering experience",
      "Experience running A/B experiments and interpreting results",
      "Proficiency in React and TypeScript",
      "Familiarity with analytics platforms and event tracking",
      "Strong understanding of SaaS funnel metrics",
    ],
    nice: [
      "Experience with Nodemailer or email automation",
      "Background in PLG (product-led growth) companies",
      "Familiarity with Firebase and Firestore",
    ],
  },
  {
    id: "j7",
    title: "AI Research Intern",
    department: "AI & Research",
    location: "Remote",
    type: "Part-time",
    posted: "3 weeks ago",
    description: "Join the AI team for a 3–6 month engagement exploring better methods for task extraction, speaker attribution, and meeting context modeling. Perfect for graduate students in NLP or ML.",
    requirements: [
      "Currently enrolled in an MSc or PhD program in CS, NLP, or related field",
      "Strong Python and ML fundamentals",
      "Familiarity with transformer architectures and LLMs",
      "Ability to read and implement research papers",
    ],
    nice: [
      "Prior research experience in meeting or dialogue systems",
      "Familiarity with LangChain or similar frameworks",
    ],
  },
];

const PERKS: Perk[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Remote-first",
    description: "Work from anywhere in the world. We care about what you build, not where you build it.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Equity for everyone",
    description: "Every full-time team member gets a meaningful equity stake. We build together and win together.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Health & wellness",
    description: "Comprehensive health, dental, and vision coverage. Plus a monthly wellness stipend.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Home office budget",
    description: "$1,500 to set up your workspace the way you work best.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Learning budget",
    description: "$2,000 per year for courses, books, conferences, or anything that makes you better.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Flexible PTO",
    description: "Unlimited time off with a minimum of 20 days encouraged. We mean it.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Annual retreats",
    description: "We fly the whole team out once a year to meet in person, build, and recharge.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Async culture",
    description: "We default to async communication. Meetings are rare, focused, and always have Syntra taking notes.",
  },
];

const VALUES: Value[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Move with intention",
    description: "We move fast but never carelessly. Every decision is made with the user and the long-term product in mind.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Radical transparency",
    description: "We share context openly across the team. Nobody should have to guess what's happening or why.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Users first, always",
    description: "Every feature we build, every bug we fix — it starts and ends with making someone's workday measurably better.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Own your work",
    description: "There are no ticket-completers here. Everyone owns a domain end-to-end and is responsible for its success.",
  },
];

const LOCATION_BADGE: Record<Location, { bg: string; color: string }> = {
  Remote: { bg: "#ECFDF5", color: "#059669" },
  Hybrid: { bg: "#EFF6FF", color: "#2563EB" },
  "On-site": { bg: "#F5F3FF", color: "#7C3AED" },
};

const TYPE_BADGE: Record<JobType, { bg: string; color: string }> = {
  "Full-time": { bg: "#F3F4F6", color: "#374151" },
  Contract: { bg: "#FEF3C7", color: "#B45309" },
  "Part-time": { bg: "#FEE2E2", color: "#B91C1C" },
};

// ─── Job Card ────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const locStyle = LOCATION_BADGE[job.location];
  const typeStyle = TYPE_BADGE[job.type];

  return (
    <div
      className="rounded-2xl border bg-white transition-all duration-200"
      style={{ borderColor: expanded ? "#7C3AED" : "#F3F4F6", boxShadow: expanded ? "0 0 0 1px #7C3AED, 0 8px 24px rgba(124,58,237,0.08)" : "none" }}
    >
      {/* Header */}
      <button
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#7C3AED" }}>
              {job.department}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{job.posted}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{job.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: locStyle.bg, color: locStyle.color }}>
              {job.location}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: typeStyle.bg, color: typeStyle.color }}>
              {job.type}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200"
            style={{ background: "#F5F3FF", transform: expanded ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-5">{job.description}</p>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Requirements</p>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Nice to have</p>
              <ul className="space-y-2">
                {job.nice.map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href={`mailto:careers@syntra.ai?subject=Application: ${encodeURIComponent(job.title)}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
          >
            Apply for this role
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<Department>("All");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredJobs = activeFilter === "All" ? JOBS : JOBS.filter((j) => j.department === activeFilter);

  const counts: Record<Department, number> = {
    All: JOBS.length,
    Engineering: JOBS.filter((j) => j.department === "Engineering").length,
    "AI & Research": JOBS.filter((j) => j.department === "AI & Research").length,
    Design: JOBS.filter((j) => j.department === "Design").length,
    Product: JOBS.filter((j) => j.department === "Product").length,
    Growth: JOBS.filter((j) => j.department === "Growth").length,
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        html { scroll-behavior: smooth; }
        nav.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease both; }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>Syntra</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Log in</a>
            <a href="/signup" className="text-sm font-semibold text-white px-4 py-2 rounded-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #fff 70%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #DDD6FE 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5 }} />
        <div className="relative z-10 max-w-3xl mx-auto fade-up">
          <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
            style={{ background: "#F5F3FF", color: "#7C3AED" }}>
            We&apos;re hiring
          </span>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#111827", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Build the future of<br />
            <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              work after meetings.
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mt-5 max-w-xl mx-auto">
            We&apos;re a small, ambitious team building the AI co-worker that turns conversations into execution. Join us and help make every meeting count.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <a href="#openings" className="text-sm font-semibold text-white px-6 py-3.5 rounded-xl"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              See open roles
            </a>
            <a href="mailto:careers@syntra.ai"
              className="text-sm font-medium text-gray-600 px-6 py-3.5 rounded-xl border border-gray-200 hover:border-violet-300 hover:text-violet-600 transition-colors">
              Send us your CV
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "12", label: "Team members" },
            { value: "100%", label: "Remote-friendly" },
            { value: `${JOBS.length}`, label: "Open roles" },
            { value: "$0", label: "Meetings without notes" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#7C3AED" }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 px-6" style={{ background: "#FAFAFB" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              How we work
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#111827" }}>
              What we believe
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              Benefits
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#111827" }}>
              What you get
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERKS.map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-violet-200 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-violet-600" style={{ background: "#F5F3FF" }}>
                  {perk.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{perk.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open roles ── */}
      <section id="openings" className="py-20 px-6 scroll-mt-24" style={{ background: "#FAFAFB" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              Open roles
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#111827" }}>
              {JOBS.length} positions open
            </h2>
            <p className="text-gray-500 text-sm mt-2">Click any role to see full details and requirements.</p>
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-1.5 mb-7 overflow-x-auto pb-1 justify-center flex-wrap">
            {DEPARTMENTS.map((dept) => {
              const isActive = activeFilter === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setActiveFilter(dept)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
                  style={{
                    background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                    color: isActive ? "#fff" : "#6B7280",
                    border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                  }}
                >
                  {dept}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                      color: isActive ? "#fff" : "#9CA3AF",
                    }}
                  >
                    {counts[dept]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Job list */}
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* No role fits? */}
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-white">
            <p className="text-sm font-semibold text-gray-900 mb-1">Don&apos;t see the right role?</p>
            <p className="text-sm text-gray-500 mb-4">
              We hire for culture and craft first. Send us your CV and tell us what you&apos;d build here.
            </p>
            <a href="mailto:careers@syntra.ai?subject=General Application"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              Send a general application
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#111827" }}>Syntra AI</span>
            <span className="text-gray-300 text-sm ml-1">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href={`/${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l}</a>
            ))}
            <a href="mailto:careers@syntra.ai" className="text-sm font-medium" style={{ color: "#7C3AED" }}>careers@syntra.ai</a>
          </div>
        </div>
      </footer>
    </div>
  );
}