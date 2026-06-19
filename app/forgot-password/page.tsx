"use client";

import { useState, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  email?: string;
  general?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: connect to Firebase Auth — sendPasswordResetEmail(auth, email)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Password reset requested for:", email);
      setEmailSent(true);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateEmail(value: string) {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  }

  async function handleResend() {
    setIsSubmitting(true);
    try {
      // TODO: re-call sendPasswordResetEmail(auth, email)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');

        .syntra-input {
          transition: all 0.15s ease;
        }
        .syntra-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }
        .syntra-input.error {
          border-color: #EF4444;
        }
        .syntra-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .btn-primary-violet {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          transition: all 0.2s ease;
        }
        .btn-primary-violet:hover:not(:disabled) {
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
          transform: translateY(-1px);
        }
        .btn-primary-violet:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-outline-violet {
          border: 1.5px solid rgba(124, 58, 237, 0.3);
          color: #7C3AED;
          transition: all 0.15s ease;
        }
        .btn-outline-violet:hover:not(:disabled) {
          background: rgba(124, 58, 237, 0.06);
          border-color: #7C3AED;
        }
        .btn-outline-violet:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-border-glow {
          box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.15), 0 24px 60px -16px rgba(124, 58, 237, 0.18);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .pop-in { animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>

      <div
        className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 sm:px-10 sm:py-12 card-border-glow"
        style={{ borderColor: "rgba(124, 58, 237, 0.15)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#111827", letterSpacing: "0.02em" }}>
            SYNTRA
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#9CA3AF" }}>
            AI Meeting Co-worker
          </span>
        </div>

        {!emailSent ? (
          <>
            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                No worries — enter your email and we&apos;ll send you a link to reset it.
              </p>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => updateEmail(e.target.value)}
                  className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.email ? "error" : "border-gray-200"}`}
                  autoFocus
                />
                {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center mb-7 pop-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(124, 58, 237, 0.1)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                We sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{email}</p>
            </div>

            <div className="space-y-3">
              <a href="/login">
                <button className="btn-primary-violet w-full text-white font-semibold text-sm rounded-xl py-3.5">
                  Back to login
                </button>
              </a>
              <button
                onClick={handleResend}
                disabled={isSubmitting}
                className="btn-outline-violet w-full font-semibold text-sm rounded-xl py-3.5 bg-white"
              >
                {isSubmitting ? "Resending..." : "Resend email"}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              Didn&apos;t get it? Check your spam folder, or make sure{" "}
              <span className="font-medium text-gray-500">{email}</span> is the right address.
            </p>
          </>
        )}

        {/* Footer link */}
        {!emailSent && (
          <p className="text-center text-sm text-gray-500 mt-7">
            Remember your password?{" "}
            <a href="/login" className="font-semibold" style={{ color: "#7C3AED" }}>
              Log in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}