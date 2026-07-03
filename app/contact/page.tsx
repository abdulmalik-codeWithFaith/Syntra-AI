"use client";

import { useState, FormEvent, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InquiryType =
  | "General"
  | "Sales"
  | "Support"
  | "Partnership"
  | "Press"
  | "Careers";

interface ContactFormData {
  fullName: string;
  email: string;
  company: string;
  inquiryType: InquiryType;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  message?: string;
  general?: string;
}

interface ContactOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INQUIRY_TYPES: InquiryType[] = [
  "General",
  "Sales",
  "Support",
  "Partnership",
  "Press",
  "Careers",
];

const CONTACT_OPTIONS: ContactOption[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Email us",
    description: "For general inquiries, partnerships, and press.",
    action: "hello@syntra.ai",
    href: "mailto:hello@syntra.ai",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
    title: "Support",
    description: "Having an issue? Our support team responds within 24 hours.",
    action: "support@syntra.ai",
    href: "mailto:support@syntra.ai",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Sales",
    description: "Interested in the Team plan or a custom arrangement?",
    action: "sales@syntra.ai",
    href: "mailto:sales@syntra.ai",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Careers",
    description: "Want to join the team? We'd love to hear from you.",
    action: "careers@syntra.ai",
    href: "mailto:careers@syntra.ai",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    company: "",
    inquiryType: "General",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.fullName.trim()) next.fullName = "Full name is required";
    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Enter a valid email address";
    }
    if (!formData.subject.trim()) next.subject = "Subject is required";
    if (!formData.message.trim()) {
      next.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      next.message = "Please write at least 20 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function updateField<K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // Send via Nodemailer API route
      const res = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setSubmitted(true);
    } catch {
      setErrors({ general: "Something went wrong sending your message. Please try emailing us directly at hello@syntra.ai" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Success state ───────────────────────────────────────────────────────────

  const SuccessState = () => (
    <div className="text-center py-12">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: "rgba(124,58,237,0.1)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Message sent!
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
        Thanks for reaching out, <strong className="text-gray-700">{formData.fullName}</strong>. We&apos;ll get back to you at <strong className="text-gray-700">{formData.email}</strong> within 24 hours.
      </p>
      <button
        onClick={() => {
          setSubmitted(false);
          setFormData({ fullName: "", email: "", company: "", inquiryType: "General", subject: "", message: "" });
        }}
        className="text-sm font-medium"
        style={{ color: "#7C3AED" }}
      >
        Send another message →
      </button>
    </div>
  );

  return (
    <div style={{ background: "#FAFAFB", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        html { scroll-behavior: smooth; }
        nav.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }
        .syntra-input { transition: all 0.15s ease; }
        .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .syntra-input.error { border-color: #EF4444; }
        .btn-violet { background: linear-gradient(135deg,#7C3AED,#6D28D9); transition: all 0.2s ease; }
        .btn-violet:hover:not(:disabled) { background: linear-gradient(135deg,#8B5CF6,#7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); transform: translateY(-1px); }
        .btn-violet:disabled { opacity: 0.6; cursor: not-allowed; }
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
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "About", href: "/about" },
              { label: "Careers", href: "/careers" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: l.label === "Contact" ? "#7C3AED" : "#6B7280" }}>
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
          Contact
        </span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#111827" }}>
          Get in touch
        </h1>
        <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto leading-relaxed">
          Have a question, a partnership idea, or just want to say hello? We read every message and reply within 24 hours.
        </p>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-14 pb-20">

        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {CONTACT_OPTIONS.map((opt) => (
            <a key={opt.title} href={opt.href}
              className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-violet-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-violet-50 transition-colors"
                style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                {opt.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-0.5">{opt.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{opt.description}</p>
              <p className="text-xs font-semibold" style={{ color: "#7C3AED" }}>{opt.action}</p>
            </a>
          ))}
        </div>

        {/* Main content: form + info */}
        <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Form ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8">
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#111827" }}
              className="mb-1">
              Send us a message
            </h2>
            <p className="text-sm text-gray-400 mb-7">Fill in the form and we&apos;ll get back to you within 24 hours.</p>

            {submitted ? <SuccessState /> : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {errors.general && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.general}
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Full name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      placeholder="John Carter"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.fullName ? "error border-red-300" : "border-gray-200"}`}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1.5">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.email ? "error border-red-300" : "border-gray-200"}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                {/* Company + Inquiry type */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Company <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="Acme Technologies"
                      value={formData.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">Inquiry type</label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => updateField("inquiryType", e.target.value as InquiryType)}
                      className="syntra-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white cursor-pointer"
                    >
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">Subject <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.subject ? "error border-red-300" : "border-gray-200"}`}
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1.5">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">Message <span className="text-red-400">*</span></label>
                  <textarea
                    rows={5}
                    placeholder="Tell us more about what you need..."
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none ${errors.message ? "error border-red-300" : "border-gray-200"}`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message
                      ? <p className="text-xs text-red-500">{errors.message}</p>
                      : <span />
                    }
                    <p className="text-xs text-gray-300 ml-auto">{formData.message.length} chars</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send message
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By sending a message you agree to our{" "}
                  <a href="/privacy" className="font-medium" style={{ color: "#7C3AED" }}>Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>

          {/* ── Right info panel ── */}
          <div className="space-y-5">
            {/* Response time */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-sm font-semibold text-gray-900">We&apos;re online</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "General inquiries", time: "< 24 hours" },
                  { label: "Support tickets", time: "< 12 hours" },
                  { label: "Sales questions", time: "< 4 hours" },
                  { label: "Security issues", time: "< 2 hours" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <span className="text-xs font-semibold" style={{ color: "#7C3AED" }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ teaser */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Common questions</h3>
              <div className="space-y-3">
                {[
                  { q: "How do I cancel my subscription?", href: "/terms#payment" },
                  { q: "Is there a free trial?", href: "/#pricing" },
                  { q: "How does Syntra join my meetings?", href: "/#how-it-works" },
                  { q: "Is my meeting data private?", href: "/privacy" },
                ].map((item) => (
                  <a key={item.q} href={item.href}
                    className="flex items-start gap-2 group">
                    <svg className="flex-shrink-0 mt-0.5 text-gray-300 group-hover:text-violet-400 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <p className="text-xs text-gray-500 group-hover:text-violet-600 transition-colors leading-snug">{item.q}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Find us online</h3>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Twitter / X",
                    handle: "@syntraai",
                    href: "https://twitter.com/syntraai",
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: "LinkedIn",
                    handle: "Syntra AI",
                    href: "https://linkedin.com/company/syntraai",
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                  {
                    label: "GitHub",
                    handle: "syntraai",
                    href: "https://github.com/syntraai",
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    ),
                  },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-violet-600 transition-colors"
                      style={{ background: "#F9FAFB" }}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-violet-600 transition-colors">{s.label}</p>
                      <p className="text-[10px] text-gray-400">{s.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#111827" }}>Syntra AI</span>
            <span className="text-gray-300 text-xs ml-1">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "About", href: "/about" },
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