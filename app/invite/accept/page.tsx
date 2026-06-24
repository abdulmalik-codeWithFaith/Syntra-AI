"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "transparent", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Weak", color: "#EF4444", width: "33%" };
  if (score <= 3) return { label: "Good", color: "#F59E0B", width: "66%" };
  return { label: "Strong", color: "#7C3AED", width: "100%" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Decode params from the invite email link
  const inviteKey = params.get("token") ?? "";           // email key (dots → underscores)
  const workspaceId = params.get("workspace") ?? "";
  const workspaceName = decodeURIComponent(params.get("name") ?? "your workspace");
  const invitedByName = decodeURIComponent(params.get("invitedBy") ?? "your team");
  // The actual email is stored in the invite doc — we read it below
  const emailParam = decodeURIComponent(params.get("email") ?? "");

  const [formData, setFormData] = useState<FormData>({ fullName: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(formData.password);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.fullName.trim()) next.fullName = "Full name is required";
    if (!formData.password) {
      next.password = "Password is required";
    } else if (formData.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    if (formData.confirmPassword !== formData.password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function updateField<K extends keyof FormData>(field: K, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!inviteKey || !workspaceId || !emailParam) {
      setErrors({ general: "Invalid invite link. Please ask your workspace owner to resend." });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Validate invite still exists and is not consumed
      const inviteSnap = await getDoc(doc(db, "invites", inviteKey));
      if (!inviteSnap.exists() || inviteSnap.data().consumed) {
        setErrors({ general: "This invite link has already been used or has expired. Ask your workspace owner to send a new one." });
        return;
      }

      // 2. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(auth, emailParam, formData.password);
      await updateProfile(credential.user, { displayName: formData.fullName });

      // 3. Send email verification
      await sendEmailVerification(credential.user);

      // 4. Accept the invite — add user to workspace members
      await setDoc(doc(db, "workspaces", workspaceId, "members", credential.user.uid), {
        uid: credential.user.uid,
        email: emailParam,
        fullName: formData.fullName,
        photoURL: null,
        role: inviteSnap.data().role ?? "Member",
        status: "Active",
        joinedAt: serverTimestamp(),
        invitedAt: inviteSnap.data().invitedAt,
      });

      // 5. Create user doc with workspace already linked
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email: emailParam,
        fullName: formData.fullName,
        photoURL: null,
        workspaceIds: [workspaceId],
        currentWorkspaceId: workspaceId,
        onboardingComplete: true, // invited members skip onboarding
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 6. Mark invite consumed
      await setDoc(doc(db, "invites", inviteKey), {
        consumed: true,
        acceptedAt: serverTimestamp(),
        acceptedBy: credential.user.uid,
      }, { merge: true });

      // 7. Redirect to verify email wall — must verify before dashboard
      router.push("/verify-email");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setErrors({ general: "An account with this email already exists. Try logging in instead." });
      } else {
        setErrors({ general: "Something went wrong. Please try again or contact support." });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Invalid link state ────────────────────────────────────────────────────

  if (!inviteKey || !workspaceId || !emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 text-center" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEF2F2" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid invite link</h1>
          <p className="text-sm text-gray-500 mb-6">This link is missing required information. Ask your workspace owner to send a new invite.</p>
          <a href="/login" className="text-sm font-semibold" style={{ color: "#7C3AED" }}>Go to login</a>
        </div>
      </div>
    );
  }

  // ─── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');
        .syntra-input { transition: all 0.15s ease; }
        .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .syntra-input.error { border-color: #EF4444; }
        .btn-violet { background: linear-gradient(135deg,#7C3AED,#6D28D9); transition: all 0.2s ease; }
        .btn-violet:hover:not(:disabled) { background: linear-gradient(135deg,#8B5CF6,#7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); transform: translateY(-1px); }
        .btn-violet:disabled { opacity: 0.6; cursor: not-allowed; }
        .card-glow { box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 24px 60px -16px rgba(124,58,237,0.18); }
      `}</style>

      <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 sm:px-10 sm:py-12 card-glow"
        style={{ borderColor: "rgba(124,58,237,0.15)" }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
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

        {/* Invite context */}
        <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-4 mb-7 text-center">
          <p className="text-xs text-violet-600 font-medium uppercase tracking-wide mb-1">You&apos;ve been invited</p>
          <p className="text-sm font-semibold text-gray-900">{invitedByName} invited you to join</p>
          <p className="text-base font-bold mt-0.5" style={{ color: "#7C3AED" }}>{workspaceName}</p>
          <p className="text-xs text-gray-400 mt-1">{emailParam}</p>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Set up your password to join the workspace</p>
        </div>

        {errors.general && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email (read-only — pre-filled from invite) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input type="email" value={emailParam} disabled
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>

          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Full name</label>
            <input type="text" placeholder="John Carter" value={formData.fullName} autoFocus
              onChange={(e) => updateField("fullName", e.target.value)}
              className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.fullName ? "error" : "border-gray-200"}`} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1.5">{errors.fullName}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters"
                value={formData.password} onChange={(e) => updateField("password", e.target.value)}
                className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${errors.password ? "error" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                </div>
                <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Confirm password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password"
                value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${errors.confirmPassword ? "error" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="btn-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Creating account...
              </>
            ) : "Accept invite & create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="font-semibold" style={{ color: "#7C3AED" }}>Log in</a>
        </p>
      </div>
    </div>
  );
}