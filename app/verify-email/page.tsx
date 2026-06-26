"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');
  .btn-violet { background: linear-gradient(135deg,#7C3AED,#6D28D9); transition: all 0.2s ease; }
  .btn-violet:hover:not(:disabled) { background: linear-gradient(135deg,#8B5CF6,#7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); transform: translateY(-1px); }
  .btn-violet:disabled { opacity: 0.6; cursor: not-allowed; }
  .card-glow { box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 24px 60px -16px rgba(124,58,237,0.18); }
  @keyframes pulse-ring {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
    70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(124,58,237,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124,58,237,0); }
  }
  .pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
`;

const SyntraLogo = () => (
  <div className="flex flex-col items-center mb-8">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    </div>
    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#111827", letterSpacing: "0.02em" }}>SYNTRA</span>
    <span className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#9CA3AF" }}>AI Meeting Co-worker</span>
  </div>
);

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email ?? "");
        // If already verified, redirect to login to sign in properly
        if (user.emailVerified) {
          router.push("/login?verified=true");
        }
      } else {
        // No user session — they may have signed up and been signed out
        // Just show the page normally
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function handleCheckVerified() {
    setChecking(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await reload(user);
        if (user.emailVerified) {
          router.push("/login?verified=true");
          return;
        }
      }
      // Not verified yet — give feedback
      setResendError("Email not verified yet. Click the link in your inbox first.");
    } catch {
      setResendError("Could not check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResendLoading(true);
    setResendError("");
    setResendSent(false);
    try {
      const user = auth.currentUser;
      if (!user) {
        setResendError("Session expired. Please log in again.");
        return;
      }
      const res = await fetch("/api/email/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          fullName: user.displayName ?? user.email?.split("@")[0] ?? "there",
        }),
      });
      if (res.ok) {
        setResendSent(true);
      } else {
        setResendError("Failed to resend. Please try again in a few minutes.");
      }
    } catch {
      setResendError("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{styles}</style>

      <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 sm:px-10 sm:py-12 card-glow text-center"
        style={{ borderColor: "rgba(124,58,237,0.15)" }}>
        <SyntraLogo />

        {/* Animated email icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center pulse-ring"
            style={{ background: "rgba(124,58,237,0.1)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
        <p className="text-sm text-gray-500 mb-1">We sent a verification link to</p>
        {email && (
          <p className="text-sm font-semibold text-gray-800 mb-5">{email}</p>
        )}

        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3.5 text-sm text-amber-700 text-left mb-6 leading-relaxed">
          <p className="font-semibold mb-1">Check your inbox</p>
          Click the verification link in the email to activate your account. The link expires in 24 hours.
        </div>

        {/* Check if verified button */}
        <button onClick={handleCheckVerified} disabled={checking}
          className="btn-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 mb-3 flex items-center justify-center gap-2">
          {checking ? (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Checking...
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              I've verified my email
            </>
          )}
        </button>

        {/* Resend */}
        {resendSent ? (
          <p className="text-sm font-medium mb-3" style={{ color: "#059669" }}>
            ✓ Verification email resent — check your inbox.
          </p>
        ) : (
          <button onClick={handleResend} disabled={resendLoading}
            className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3">
            {resendLoading ? "Resending..." : "Resend verification email"}
          </button>
        )}

        {resendError && (
          <p className="text-xs text-red-500 mb-3">{resendError}</p>
        )}

        <p className="text-xs text-gray-400 leading-relaxed">
          Didn&apos;t get it? Check your spam folder. The email comes from your Syntra AI account.
        </p>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <a href="/login" className="text-sm font-medium" style={{ color: "#7C3AED" }}>
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}