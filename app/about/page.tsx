"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  gradient: string;
  links: { label: string; href: string }[];
}

interface Milestone {
  date: string;
  title: string;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM: TeamMember[] = [
  {
    name: "Abdulrosheed Abdulmalik",
    role: "Founder & Lead Developer",
    bio: "Abdulrosheed built Syntra AI from the ground up — architecture, infrastructure, AI pipeline, and every line of code. Frustrated by meetings that ended with no record of what was decided or who owned what, he set out to build the tool he always wished existed. He believes software should remove friction, not create it.",
    initials: "/malik.jpg",
    gradient: "linear-gradient(135deg, #2563EB, #7C3AED)",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/abdulmalik-abdulrosheed-35780541b?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
      { label: "Twitter", href: "https://x.com/broskiprop94216" },
    ],
  },
  {
    name: "Imran Musa",
    role: "CEO & Product Design",
    bio: "Imran leads Syntra AI's product vision and design. He shapes how Syntra looks, how it feels, and where it goes next. With a sharp eye for what makes software feel human, he bridges the gap between powerful AI technology and the people who use it every day in their meetings and workflows.",
    initials: "/imran.jpg",
    gradient: "linear-gradient(135deg, #7C3AED, #DB2777)",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/imran-musa-/" },
      { label: "Twitter", href: "https://x.com/haajeth_" },
    ],
  },
];

const MILESTONES: Milestone[] = [
  {
    date: "Jan 2026",
    title: "The idea",
    description: "After sitting through a 2-hour strategy meeting that ended with zero written outcomes, Abdulrosheed started building Syntra AI the next morning.",
  },
  {
    date: "Feb 2026",
    title: "First prototype",
    description: "The first working version could join a Google Meet call, transcribe speech, and extract tasks. It was rough — but it worked.",
  },
  {
    date: "Mar 2026",
    title: "Imran joins",
    description: "Imran came on board to lead product design and strategy. Together, the two transformed a technical prototype into a product people actually wanted to use.",
  },
  {
    date: "Apr 2026",
    title: "Gemini integration",
    description: "Switched the AI backbone to Google Gemini for smarter extraction, better context understanding, and real voice interaction during live meetings.",
  },
  {
    date: "May 2026",
    title: "Full platform",
    description: "Shipped the complete Syntra AI platform — dashboard, task tracking, PDF reports, team workspaces, and the autonomous agent that joins meetings without being told to.",
  },
  {
    date: "Jun 2026",
    title: "Opening up",
    description: "Syntra AI opens to the public. The goal: make sure no meeting ever ends without a clear record of what was decided and who owns what.",
  },
];

const STATS = [
  { value: "2", label: "Founders" },
  { value: "100%", label: "Built from scratch" },
  { value: "0", label: "VC funding (self-built)" },
  { value: "∞", label: "Meetings fixed" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        html { scroll-behavior: smooth; }
        nav.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s ease 0.15s both; }
        .fade-up-3 { animation: fadeUp 0.7s ease 0.3s both; }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={200} height={200}/>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "About", href: "/about" },
              { label: "Careers", href: "/careers" },
            ].map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: l.label === "About" ? "#7C3AED" : "#6B7280" }}>
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

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #fff 70%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #DDD6FE 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5 }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 fade-up"
            style={{ background: "#F5F3FF", color: "#7C3AED" }}>
            Our story
          </span>
          <h1 className="fade-up-2"
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#111827", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            We built the meeting<br />
            <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              we always needed.
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mt-5 max-w-2xl mx-auto fade-up-3">
            Syntra AI started with a simple frustration: too many meetings ending with no record of what was decided,
            no clarity on who owns what, and no accountability for follow-through.
            So we built the solution ourselves.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "2.2rem", background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {s.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                Why we exist
              </span>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#111827", lineHeight: 1.15, marginBottom: "1rem" }}>
                Meetings should create work, not lose it.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                The average professional sits through hundreds of hours of meetings every year.
                Most of those meetings end the same way: someone promises to "send notes later,"
                action items are scattered across three different apps, and two weeks later nobody
                remembers what was actually decided.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Syntra AI exists to close that gap. Not as a passive recording tool — but as an
                active participant that listens, thinks, speaks up when something is unclear, and
                turns every conversation into structured, actionable work.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                We believe AI should be a co-worker, not a feature. Something that handles the
                administrative weight of meetings so you can focus entirely on the conversation itself.
              </p>
            </div>

            {/* Mission card */}
            <div className="rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1A1240, #2D1B6E)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top right, rgba(124,58,237,0.3), transparent 60%)" }} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </div>
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Our mission</p>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", lineHeight: 1.4 }}>
                  Make sure no meeting ever ends without a clear record of what was decided and who owns what.
                </p>
                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  {[
                    "Every task gets an owner",
                    "Every decision gets recorded",
                    "Every meeting gets a summary",
                    "No one has to write notes",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.4)" }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-6" style={{ background: "#FAFAFB" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              The team
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#111827" }}>
              Two people. One product.
            </h2>
            <p className="text-gray-500 text-sm mt-3 max-w-lg mx-auto">
              Syntra AI was built by two people who got tired of bad meetings and decided to fix the problem themselves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {TEAM.map((member) => (
              <div key={member.name}
                className="rounded-2xl border border-gray-100 bg-white p-7 hover:border-violet-200 hover:shadow-md transition-all duration-200">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    // style={{ background: member.gradient }}
                  >
                    <img src={member.initials} className="rounded-4xl" alt="profile-pictire"/>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold mt-0.5 uppercase tracking-wide" style={{ color: "#7C3AED" }}>
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{member.bio}</p>

                {/* Links */}
                <div className="flex items-center gap-3">
                  {member.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: "rgba(124,58,237,0.25)", color: "#7C3AED" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F3FF"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Hiring note */}
          <div className="mt-8 rounded-2xl border border-dashed border-violet-200 p-6 text-center"
            style={{ background: "#FAFAFF" }}>
            <p className="text-sm font-semibold text-gray-900 mb-1">We&apos;re growing the team</p>
            <p className="text-sm text-gray-500 mb-4">
              We&apos;re hiring engineers, designers, and AI researchers who want to work on something meaningful.
            </p>
            <a href="/careers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#7C3AED" }}>
              See open roles
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              Timeline
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#111827" }}>
              How we got here
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, #7C3AED, #2563EB)" }} />

            <div className="space-y-10">
              {MILESTONES.map((m, i) => (
                <div key={m.date} className="flex gap-6 relative">
                  {/* Dot */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white"
                    style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                    <span className="text-white font-bold text-xs">{i + 1}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <p className="text-xs font-mono font-semibold mb-1" style={{ color: "#7C3AED" }}>{m.date}</p>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#111827", marginBottom: "0.25rem" }}>
                      {m.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1240, #2D1B6E)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#fff", lineHeight: 1.1, marginBottom: "1rem" }}>
            Ready to try it?
          </h2>
          <p className="mb-8 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Syntra is free to start. No credit card. Your first meeting can be today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/signup"
              className="px-7 py-3.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              Start for free
            </a>
            <a href="/careers"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
              Join the team
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6" style={{ background: "#05070F" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={200} height={200}/>
            <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Home", href: "/" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Careers", href: "/careers" },
            ].map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}