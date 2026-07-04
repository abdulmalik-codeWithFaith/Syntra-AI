"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

type Mode = "detecting" | "new_user" | "existing_user";

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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');
  .syntra-input { transition: all 0.15s ease; }
  .syntra-input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
  .syntra-input.error { border-color: #EF4444; }
  .btn-violet { background: linear-gradient(135deg,#7C3AED,#6D28D9); transition: all 0.2s ease; }
  .btn-violet:hover:not(:disabled) { background: linear-gradient(135deg,#8B5CF6,#7C3AED); box-shadow: 0 8px 20px rgba(124,58,237,0.3); transform: translateY(-1px); }
  .btn-violet:disabled { opacity: 0.6; cursor: not-allowed; }
  .card-glow { box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 24px 60px -16px rgba(124,58,237,0.18); }
`;

const SyntraLogo = () => (
  <div className="flex flex-col items-center mb-7">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    </div>
    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#111827", letterSpacing: "0.02em" }}>SYNTRA</span>
    <span className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#9CA3AF" }}>AI Meeting Co-worker</span>
  </div>
);

function EyeIcon({ show }: { show: boolean }) {
  return show
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function InviteAcceptInner() {
  const router = useRouter();
  const params = useSearchParams();

  const inviteKey     = params.get("token") ?? "";
  const workspaceId   = params.get("workspace") ?? "";
  const workspaceName = decodeURIComponent(params.get("name") ?? "your workspace");
  const invitedByName = decodeURIComponent(params.get("invitedBy") ?? "your team");
  const emailParam    = decodeURIComponent(params.get("email") ?? "");

  // The placeholder member doc was created with inviteKey as the doc ID
  // We'll delete it and replace with the real uid on accept
  const placeholderMemberId = inviteKey;

  const [mode, setMode]           = useState<Mode>("detecting");
  const [fullName, setFullName]   = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  // ── Validate invite and detect if user exists ─────────────────────────────
  // Uses Firebase Admin SDK via API route — reliable, unlike client-side
  // sign-in detection which can't distinguish "wrong password" from
  // "user doesn't exist" on newer Firebase SDK versions (both return
  // auth/invalid-credential for security reasons).
  async function handleCheckEmail() {
    setIsSubmitting(true);
    setErrors({});
    try {
      // Read invite doc (public read allowed)
      const inviteSnap = await getDoc(doc(db, "invites", inviteKey));
      if (!inviteSnap.exists() || inviteSnap.data().consumed) {
        setErrors({ general: "This invite link has already been used or has expired." });
        return;
      }

      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: "Could not verify your email. Please try again." });
        return;
      }

      setMode(data.exists ? "existing_user" : "new_user");
    } catch (err: any) {
      console.error("Check email error:", err);
      setErrors({ general: `Error: ${err.message ?? err.code}` });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Core: add authenticated user to workspace ─────────────────────────────
  // Called after auth succeeds. Does NOT query members collection.
 
  async function addToWorkspace(uid: string, name: string, inviteData: any) {
  // 1. Delete placeholder member doc FIRST (via API since rules block client)
  await fetch("/api/team/remove-placeholder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, placeholderMemberId }),
  });

  // 2. Write real member doc using the user's actual UID
  await setDoc(doc(db, `workspaces/${workspaceId}/members`, uid), {
    uid,
    email: emailParam,
    fullName: name,
    photoURL: null,
    role: inviteData.role ?? "Member",
    status: "Active",
    joinedAt: serverTimestamp(),
    invitedAt: inviteData.createdAt ?? serverTimestamp(),
  });

  // 3. Update user doc
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await updateDoc(userRef, {
      workspaceIds: arrayUnion(workspaceId),
      currentWorkspaceId: workspaceId,
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, {
      uid,
      email: emailParam,
      fullName: name,
      photoURL: null,
      workspaceIds: [workspaceId],
      currentWorkspaceId: workspaceId,
      onboardingComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 4. Mark invite consumed
  await setDoc(doc(db, "invites", inviteKey), {
    consumed: true,
    acceptedAt: serverTimestamp(),
    acceptedBy: uid,
  }, { merge: true });
}
  // ── Existing user: log in to accept ──────────────────────────────────────
  async function handleExistingUser(e: FormEvent) {
    e.preventDefault();
    if (!password) { setErrors({ password: "Password is required" }); return; }
    setIsSubmitting(true);
    setErrors({});
    try {
      const inviteSnap = await getDoc(doc(db, "invites", inviteKey));
      if (!inviteSnap.exists() || inviteSnap.data().consumed) {
        setErrors({ general: "This invite link has already been used or expired." });
        return;
      }
      const result = await signInWithEmailAndPassword(auth, emailParam, password);
      const { user } = result;
      const name = user.displayName ?? emailParam.split("@")[0];
      await addToWorkspace(user.uid, name, inviteSnap.data());
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrors({ password: "Incorrect password. Please try again." });
      } else {
        setErrors({ general: `Something went wrong: ${err.message ?? err.code}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── New user: create account and accept ───────────────────────────────────
  async function handleNewUser(e: FormEvent) {
    e.preventDefault();
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Password must be at least 8 characters";
    if (confirmPw !== password) next.confirmPassword = "Passwords do not match";
    if (Object.keys(next).length) { setErrors(next); return; }

    setIsSubmitting(true);
    setErrors({});
    try {
      const inviteSnap = await getDoc(doc(db, "invites", inviteKey));
      if (!inviteSnap.exists() || inviteSnap.data().consumed) {
        setErrors({ general: "This invite link has already been used or expired." });
        return;
      }
      const credential = await createUserWithEmailAndPassword(auth, emailParam, password);
      await updateProfile(credential.user, { displayName: fullName });
      await addToWorkspace(credential.user.uid, fullName, inviteSnap.data());

      // Send verification email
      await fetch("/api/email/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: credential.user.uid, email: emailParam, fullName }),
      });

      router.push("/verify-email");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setMode("existing_user");
        setErrors({ general: "An account with this email already exists. Please log in below." });
      } else {
        setErrors({ general: `Something went wrong: ${err.message ?? err.code}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const InviteBanner = () => (
    <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-4 mb-7 text-center">
      <p className="text-xs text-violet-600 font-medium uppercase tracking-wide mb-1">You&apos;ve been invited</p>
      <p className="text-sm font-semibold text-gray-900">{invitedByName} invited you to join</p>
      <p className="text-base font-bold mt-0.5" style={{ color: "#7C3AED" }}>{workspaceName}</p>
      <p className="text-xs text-gray-400 mt-1">{emailParam}</p>
    </div>
  );

  if (!inviteKey || !workspaceId || !emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
        <style>{styles}</style>
        <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 text-center card-glow" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
          <SyntraLogo />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid invite link</h1>
          <p className="text-sm text-gray-500 mb-6">Ask your workspace owner to send a new invite.</p>
          <a href="/login" className="text-sm font-semibold" style={{ color: "#7C3AED" }}>Go to login</a>
        </div>
      </div>
    );
  }

  // ── Step 0: detect ────────────────────────────────────────────────────────
  if (mode === "detecting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
        <style>{styles}</style>
        <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 sm:px-10 sm:py-12 card-glow" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
          <SyntraLogo />
          <InviteBanner />
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Accept your invite</h1>
            <p className="text-gray-500 text-sm">We&apos;ll check if you already have a Syntra account.</p>
          </div>
          {errors.general && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.general}</div>}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input type="email" value={emailParam} disabled className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <button onClick={handleCheckEmail} disabled={isSubmitting}
            className="btn-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2">
            {isSubmitting ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Checking...</> : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  // ── Existing user ─────────────────────────────────────────────────────────
  if (mode === "existing_user") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
        <style>{styles}</style>
        <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 sm:px-10 sm:py-12 card-glow" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
          <SyntraLogo />
          <InviteBanner />
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back!</h1>
            <p className="text-gray-500 text-sm">You already have an account. Log in to join <strong>{workspaceName}</strong>.</p>
          </div>
          {errors.general && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.general}</div>}
          <form onSubmit={handleExistingUser} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
              <input type="email" value={emailParam} disabled className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} autoFocus
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="Enter your password"
                  className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${errors.password ? "error" : "border-gray-200"}`} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon show={showPw} /></button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
            </div>
            <a href="/forgot-password" className="inline-block text-xs font-medium" style={{ color: "#7C3AED" }}>Forgot password?</a>
            <button type="submit" disabled={isSubmitting}
              className="btn-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2">
              {isSubmitting ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Joining...</> : "Log in & join workspace"}
            </button>
          </form>
          <button onClick={() => { setMode("detecting"); setErrors({}); setPassword(""); }} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-4">← Back</button>
        </div>
      </div>
    );
  }

  // ── New user ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{styles}</style>
      <div className="w-full max-w-md rounded-3xl border bg-white px-8 py-10 sm:px-10 sm:py-12 card-glow" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
        <SyntraLogo />
        <InviteBanner />
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Set up your password to join <strong>{workspaceName}</strong>.</p>
        </div>
        {errors.general && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.general}</div>}
        <form onSubmit={handleNewUser} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input type="email" value={emailParam} disabled className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Full name</label>
            <input type="text" placeholder="John Carter" value={fullName} autoFocus
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
              className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.fullName ? "error" : "border-gray-200"}`} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1.5">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} placeholder="At least 8 characters" value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${errors.password ? "error" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon show={showPw} /></button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                </div>
                <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Confirm password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${errors.confirmPassword ? "error" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon show={showConfirm} /></button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="btn-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2">
            {isSubmitting ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Creating account...</> : "Accept invite & create account"}
          </button>
        </form>
        <button onClick={() => { setMode("detecting"); setErrors({}); setPassword(""); setFullName(""); setConfirmPw(""); }} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-4">← Back</button>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFB" }}>
        <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    }>
      <InviteAcceptInner />
    </Suspense>
  );
}