"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepItem {
  title: string;
  desc: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface WaveformBarProps {
  delay: number;
  height: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_BG = "#1A1240"; // deep violet-black, matches the auth-page gradient family
const CARD_BORDER = "rgba(124,58,237,0.22)";

const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Team", href: "#team" },
];

const WAVEFORM_HEIGHTS: number[] = [
  18, 32, 52, 68, 88, 68, 52, 88, 38, 62, 78, 48, 28, 72, 58, 42, 82, 52, 32, 68,
];

const FEATURES: FeatureCardProps[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
      </svg>
    ),
    title: "Real-time transcription",
    description: "Joins Zoom, Google Meet, and Teams as an AI participant. Transcribes every word in real time with speaker identification.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
    title: "Automatic task extraction",
    description: "Every task, owner, and deadline mentioned gets captured and assigned — no one has to remember to write things down.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    ),
    title: "Voice interaction",
    description: 'Say "Syntra" mid-meeting to ask a question. It also speaks up proactively when a task has no owner or no deadline.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    title: "PDF reports",
    description: "After every meeting, a structured PDF with summary, decisions, and task list is generated and stored — ready to share.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
      </svg>
    ),
    title: "Calendar auto-join",
    description: "Connect your calendar and Syntra joins every scheduled meeting on time. The app doesn't even need to be open.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    ),
    title: "Decision tracking",
    description: "Every decision is recorded, timestamped, and searchable — so nothing gets relitigated two weeks later.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    title: "Team workspaces",
    description: "Invite teammates, share task boards, and keep the whole team accountable — all from one shared workspace.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
      </svg>
    ),
    title: "Powered by Gemini AI",
    description: "Google Gemini drives extraction, summarization, and voice. It understands conversation context — not just keywords.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
    ),
    title: "Private & encrypted",
    description: "All transcripts encrypted at rest and in transit. You control who sees what — guests, teammates, or just you.",
  },
];

const STEPS: StepItem[] = [
  {
    title: "Connect your workspace",
    desc: "Set up your team workspace, name your Syntra agent, and connect Google Calendar or Zoom in under 5 minutes.",
  },
  {
    title: "Syntra joins automatically",
    desc: "When a meeting begins, Syntra is already there — listening and transcribing in real time. You don't touch anything.",
  },
  {
    title: "AI extracts what matters",
    desc: "Tasks, owners, deadlines, and decisions are pulled from the conversation using Gemini AI. If something's missing, Syntra asks.",
  },
  {
    title: "Dashboard is ready after",
    desc: "Everything waits for you — full summary, task list with owners, decisions log, and a downloadable PDF report.",
  },
];

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For individuals who want to stop forgetting what was said.",
    features: [
      "5 meetings per month",
      "AI task extraction",
      "Meeting summaries",
      "1 workspace",
      "PDF export",
      "7-day transcript history",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For professionals who run meetings and need accountability.",
    features: [
      "Unlimited meetings",
      "Voice interaction (Syntra speaks)",
      "AI task extraction + decisions",
      "3 workspaces",
      "PDF reports + cloud storage",
      "Calendar auto-join",
      "Email reminders",
      "90-day history",
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "For teams that need shared accountability across all meetings.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Shared task dashboard",
      "Team-level reporting",
      "Zoom + Meet + Teams",
      "Priority support",
      "Unlimited history",
      "Custom agent name & voice",
    ],
    cta: "Get Team",
    highlighted: false,
  },
];

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Abdulrosheed Abdulmalik",
    role: "Founder & Developer",
    bio: "Former engineering lead at a Fortune 500 company. Built Syntra after losing track of action items in a 2-hour planning meeting.",
    initials: "AA",
    color: "#7C3AED",
  },
  {
    name: "Imran Musa",
    role: "CEO & Product designer",
    bio: "Product designer focused on making AI feel human. Previously designed collaboration tools used by 2M+ users.",
    initials: "IM",
    color: "#DB2777",
  },
  {
    name: "Pending",
    role: "Social Media Manager",
    bio: "Product designer focused on making AI feel human. Previously designed collaboration tools used by 2M+ users.",
    initials: "PP",
    color: "#DB2777",
  },
  {
    name: "Coming soon",
    role: "Customer support",
    bio: "Product designer focused on making AI feel human. Previously designed collaboration tools used by 2M+ users.",
    initials: "CS",
    color: "#DB2777",
  },
];

const STATS: StatItem[] = [
  { value: "0 min", label: "Setup time to first meeting" },
  { value: "100%", label: "Meetings captured automatically" },
  { value: "<30s", label: "Summary after meeting ends" },
  { value: "0", label: "Tasks that fall through the cracks" },
];

const FAQS: FAQItem[] = [
  {
    question: "How does Syntra join my meetings?",
    answer: "Syntra connects to your Google Calendar or Zoom account. When a meeting is scheduled, it automatically joins as a participant at the right time — no manual action needed.",
  },
  {
    question: "Does it work if I forget to invite it?",
    answer: "Yes. You can also paste a custom meeting link directly in your workspace and Syntra will join at the scheduled time.",
  },
  {
    question: "Is my meeting data private?",
    answer: "All transcripts are encrypted at rest and in transit. Only workspace members you invite can access meeting data. You can delete any record at any time.",
  },
  {
    question: "What AI model does Syntra use?",
    answer: "Syntra uses Google Gemini for meeting extraction, summarization, and voice responses. It understands context and conversation flow — not just keywords.",
  },
  {
    question: "Can I use Syntra without staying in the meeting?",
    answer: "Absolutely. That's the point. Syntra runs autonomously. Close the app, attend another meeting, go for a walk — everything will be in your dashboard when you return.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function WaveformBar({ delay, height }: WaveformBarProps) {
  return (
    <div
      className="rounded-full"
      style={{
        width: "3px",
        height: `${height}px`,
        background: "linear-gradient(to top, #2563EB, #7C3AED)",
        animation: "waveform 1.2s ease-in-out infinite alternate",
        animationDelay: `${delay}s`,
        minHeight: "4px",
      }}
    />
  );
}

function LiveBadge() {
  const [dots, setDots] = useState<number>(0);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono mb-8"
      style={{ borderColor: "rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.06)", color: "#7C3AED" }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7C3AED" }} />
      Syntra is listening{".".repeat(dots)}
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex items-center justify-center gap-1 h-20 my-8">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <WaveformBar key={i} delay={i * 0.06} height={h} />
      ))}
    </div>
  );
}

function MeetingCard() {
  const [taskVisible, setTaskVisible] = useState<boolean>(false);
  const [decisionVisible, setDecisionVisible] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTaskVisible(true), 1800);
    const t2 = setTimeout(() => setDecisionVisible(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ background: CARD_BG, borderColor: CARD_BORDER, maxWidth: 500 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-white/60 text-sm font-mono">Q3 Planning · Google Meet</span>
        </div>
        <span className="text-xs font-mono" style={{ color: "#A78BFA" }}>42:17</span>
      </div>
      {/* Transcript */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">J</div>
          <div className="rounded-xl rounded-tl-none px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)" }}>
            "...we need to launch the beta by August 15th, Sarah owns that."
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="rounded-xl rounded-tr-none px-3 py-2 text-sm border" style={{ background: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.3)", color: "rgba(255,255,255,0.7)" }}>
            "Agreed. Marketing assets go to Mike by Friday."
          </div>
          <div className="w-6 h-6 rounded-full bg-purple-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">S</div>
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
          </div>
          <div className="rounded-xl rounded-tl-none px-3 py-2 text-sm border" style={{ background: "rgba(124,58,237,0.12)", borderColor: "rgba(167,139,250,0.25)", color: "#C4B5FD" }}>
            Syntra: Got it — task assigned to Sarah, Aug 15. Mike&apos;s deliverable noted for Friday.
          </div>
        </div>
      </div>
      {/* Extracted */}
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-700"
          style={{ background: "rgba(37,99,235,0.12)", borderColor: "rgba(37,99,235,0.25)", opacity: taskVisible ? 1 : 0, transform: taskVisible ? "translateY(0)" : "translateY(8px)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-mono text-blue-300">TASK</span>
          <span className="text-sm text-white/80 flex-1">Beta launch → Sarah</span>
          <span className="text-xs font-mono text-blue-400">Aug 15</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-700"
          style={{ background: "rgba(124,58,237,0.14)", borderColor: "rgba(167,139,250,0.25)", opacity: decisionVisible ? 1 : 0, transform: decisionVisible ? "translateY(0)" : "translateY(8px)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-xs font-mono text-violet-300">DECISION</span>
          <span className="text-sm text-white/80">Marketing assets finalized this week</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl p-6 border transition-all duration-300 group hover:shadow-lg"
      style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
        style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.3)", color: "#A78BFA" }}>
        {icon}
      </div>
      <h3 className="font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{description}</p>
    </div>
  );
}

function StepRow({ number, title, description, isLast }: { number: number; title: string; description: string; isLast: boolean }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", border: "2px solid rgba(167,139,250,0.3)" }}>
          {number}
        </div>
        {!isLast && <div className="w-px flex-1 mt-2 min-h-10" style={{ background: "rgba(124,58,237,0.25)" }} />}
      </div>
      <div className="pb-10">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div className="rounded-2xl p-7 flex flex-col border transition-all duration-300 relative"
      style={{
        background: plan.highlighted ? CARD_BG : "#fff",
        borderColor: plan.highlighted ? "#7C3AED" : "#E5E7EB",
        boxShadow: plan.highlighted ? "0 0 0 1px #7C3AED, 0 20px 60px rgba(124,58,237,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: plan.highlighted ? "scale(1.025)" : "scale(1)",
      }}>
      {plan.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          Most popular
        </div>
      )}
      <div className="mb-6">
        <p className="text-sm font-mono mb-1" style={{ color: plan.highlighted ? "rgba(255,255,255,0.5)" : "#6B7280" }}>{plan.name}</p>
        <div className="flex items-end gap-1 mb-2">
          <span className="font-bold" style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.5rem", lineHeight: 1, color: plan.highlighted ? "#fff" : "#111827" }}>{plan.price}</span>
          <span className="text-sm mb-1" style={{ color: plan.highlighted ? "rgba(255,255,255,0.35)" : "#9CA3AF" }}>/ {plan.period}</span>
        </div>
        <p className="text-sm" style={{ color: plan.highlighted ? "rgba(255,255,255,0.45)" : "#6B7280" }}>{plan.description}</p>
      </div>
      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm" style={{ color: plan.highlighted ? "rgba(255,255,255,0.65)" : "#374151" }}>
            <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill={plan.highlighted ? "#A78BFA" : "#7C3AED"}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <a href="/signup">
        <button className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={plan.highlighted
            ? { background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff", border: "none" }
            : { background: "transparent", color: "#7C3AED", border: "1.5px solid #7C3AED" }}>
          {plan.cta}
        </button>
      </a>
    </div>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="rounded-2xl p-6 border transition-all duration-300"
      style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: `${member.color}25`, border: `1.5px solid ${member.color}50`, color: member.color }}>
          {member.initials}
        </div>
        <div>
          <h3 className="font-semibold text-white">{member.name}</h3>
          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{member.role}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{member.bio}</p>
    </div>
  );
}

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button className="w-full flex items-center justify-between py-5 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="text-gray-800 text-sm font-medium pr-6 hover:text-gray-900">{item.question}</span>
        <span className={`flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`} style={{ color: "#7C3AED" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      {open && <p className="text-sm leading-relaxed text-gray-500 pb-5">{item.answer}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SyntraLanding() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [billingAnnual, setBillingAnnual] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "#111827", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes waveform {
          0%   { transform: scaleY(0.3); opacity: 0.5; }
          100% { transform: scaleY(1);   opacity: 1;   }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-10px); }
        }

        .hero-title  { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.6rem, 6vw, 4.8rem); line-height: 1.04; letter-spacing: -0.03em; animation: fadeUp 0.7s ease both; }
        .hero-sub    { animation: fadeUp 0.7s ease 0.12s both; }
        .hero-cta    { animation: fadeUp 0.7s ease 0.24s both; }
        .floating    { animation: float 4s ease-in-out infinite; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.15; letter-spacing: -0.02em; }

        .violet-text { background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .btn-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #fff; border: none; transition: all 0.2s ease; }
        .btn-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 24px rgba(124,58,237,0.35); transform: translateY(-1px); }

        .btn-outline { background: transparent; color: #7C3AED; border: 1.5px solid #DDD6FE; transition: all 0.2s ease; }
        .btn-outline:hover { border-color: #7C3AED; background: #F5F3FF; }

        nav.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }

        .hero-bg { background: linear-gradient(180deg, #F5F3FF 0%, #ffffff 60%); }

        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>Syntra</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium transition-colors" style={{ color: "#6B7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login"><button className="btn-outline px-4 py-2 rounded-lg text-sm font-medium">Log in</button></a>
            <a href="/signup"><button className="btn-violet px-4 py-2 rounded-lg text-sm font-semibold">Get started</button></a>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" style={{ color: "#6B7280" }} onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" /></>)}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 space-y-3 border-t border-gray-100" style={{ background: "#fff" }}>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="block text-sm font-medium py-1.5 text-gray-600 hover:text-gray-900" onClick={() => setMenuOpen(false)}>{link.label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <a href="/login" className="flex-1"><button className="btn-outline w-full py-2 rounded-lg text-sm font-medium">Log in</button></a>
              <a href="/signup" className="flex-1"><button className="btn-violet w-full py-2 rounded-lg text-sm font-semibold">Get started</button></a>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #DDD6FE 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.6,
        }} />
        {/* Violet glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <LiveBadge />

          <h1 className="hero-title text-gray-900 mb-6">
            Your meetings run.<br />
            <span className="violet-text">Syntra handles the follow-through.</span>
          </h1>

          <p className="hero-sub text-gray-500 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Syntra joins your meetings, listens to every word, and turns conversations into tasks, decisions, and reports — automatically.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/signup">
              <button className="btn-violet px-7 py-3.5 rounded-xl font-semibold text-base">Start for free</button>
            </a>
            <button className="btn-outline px-7 py-3.5 rounded-xl font-medium text-base flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#7C3AED"><path d="M8 5v14l11-7z" /></svg>
              Watch demo
            </button>
          </div>

          <Waveform />
          <p className="text-xs font-mono tracking-widest uppercase text-gray-400">Live transcription active</p>
        </div>

        {/* Floating card */}
        <div className="relative z-10 mt-14 floating" style={{ filter: "drop-shadow(0 24px 48px rgba(124,58,237,0.2))" }}>
          <MeetingCard />
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="py-14 px-6 border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-bold text-3xl mb-1 violet-text" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div className="text-xs text-gray-400 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "#F5F3FF", color: "#7C3AED" }}>
            What Syntra does
          </span>
          <h2 className="section-title text-gray-900 mb-4">Not a note-taker. A co-worker.</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Every feature is built around one idea: your meetings should create work, not more work to manage after.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: "#F9FAFB" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              The flow
            </span>
            <h2 className="section-title text-gray-900 mb-4">Set it up once. It works forever.</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              Syntra runs autonomously. You don&apos;t stay in the app. You don&apos;t press start. You just show up to your meeting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              {STEPS.map((step, i) => (
                <StepRow key={step.title} number={i + 1} title={step.title} description={step.desc} isLast={i === STEPS.length - 1} />
              ))}
            </div>

            {/* Code mockup */}
            <div className="rounded-2xl overflow-hidden border sticky top-28" style={{ background: CARD_BG, borderColor: CARD_BORDER, boxShadow: "0 20px 60px rgba(124,58,237,0.18)" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <span className="text-xs font-mono ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>syntra-workspace.json</span>
              </div>
              <pre className="px-5 py-5 text-xs leading-relaxed overflow-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>{"{\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"workspace\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#86EFAC" }}>{"\"Acme Technologies\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{",\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"agentName\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#86EFAC" }}>{"\"Syntra\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{",\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"platform\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#86EFAC" }}>{"\"Google Meet\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{",\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"voiceEnabled\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#A78BFA" }}>{"true"}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{",\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"generatePDFs\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#A78BFA" }}>{"true"}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{",\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"taskTracking\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#A78BFA" }}>{"true"}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{",\n"}</span>
                <span style={{ color: "#C4B5FD" }}>{"  \"status\""}</span><span style={{ color: "rgba(255,255,255,0.3)" }}>{": "}</span><span style={{ color: "#86EFAC" }}>{"\"active\""}</span><span style={{ color: "rgba(255,255,255,0.25)" }}>{"\n}"}</span>
              </pre>
              <div className="border-t px-5 py-3 flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Agent active · Next meeting in 2h 14m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "#F5F3FF", color: "#7C3AED" }}>
            Pricing
          </span>
          <h2 className="section-title text-gray-900 mb-4">Start free. Scale when you need to.</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm mb-8">No meeting limits on Pro and Team. Pay for what your team actually uses.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 bg-gray-50">
            <button onClick={() => setBillingAnnual(false)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: !billingAnnual ? "#fff" : "transparent", color: !billingAnnual ? "#111827" : "#9CA3AF", boxShadow: !billingAnnual ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              Monthly
            </button>
            <button onClick={() => setBillingAnnual(true)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{ background: billingAnnual ? "#fff" : "transparent", color: billingAnnual ? "#111827" : "#9CA3AF", boxShadow: billingAnnual ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              Annual
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#EDE9FE", color: "#6D28D9" }}>–20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
        <p className="text-center text-gray-400 text-xs mt-8">All plans include a 14-day free trial of Pro features · No credit card required</p>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-24 px-6" style={{ background: "#F9FAFB" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              The team
            </span>
            <h2 className="section-title text-gray-900 mb-4">Built by people who hated bad meetings.</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              We&apos;ve all been in meetings that ended with no record of what was decided or who owns what. Syntra is the tool we built for ourselves.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM_MEMBERS.map((m) => (
              <TeamCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "#F5F3FF", color: "#7C3AED" }}>
            FAQ
          </span>
          <h2 className="section-title text-gray-900">Common questions</h2>
        </div>
        <div className="rounded-2xl border border-gray-100 px-6 bg-white shadow-sm">
          {FAQS.map((item) => (
            <FAQRow key={item.question} item={item} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: CARD_BG }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-white mb-5" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.1 }}>
            Your next meeting starts in 9 minutes.
          </h2>
          <p className="mb-10 text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>Syntra can be ready before it begins.</p>
          <a href="/signup">
            <button className="btn-violet px-8 py-4 rounded-xl font-semibold text-lg">Activate Syntra free</button>
          </a>
          <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>No credit card required · Works with Zoom &amp; Google Meet</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </div>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#111827" }}>Syntra AI</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">Your AI meeting co-worker. Turns conversations into action.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { heading: "Product", links: ["Features", "How it works", "Pricing", "Changelog"] },
                { heading: "Company", links: ["About", "Team", "Blog", "Careers"] },
                { heading: "Legal", links: ["Privacy", "Terms", "Security", "Contact"] },
              ].map((col) => (
                <div key={col.heading}>
                  <p className="text-xs font-mono uppercase tracking-widest mb-3 text-gray-400">{col.heading}</p>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l}><a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-300">© 2025 Syntra AI. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}