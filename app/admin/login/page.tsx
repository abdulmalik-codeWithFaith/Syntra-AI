"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check isAdmin flag on user doc
      const userSnap = await getDoc(doc(db, "users", result.user.uid));
      if (!userSnap.exists() || !userSnap.data().isAdmin) {
        await auth.signOut();
        setError("You don't have admin access.");
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid credentials. Try again.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-0)", padding: "40px 20px", fontFamily: "var(--font-sans)" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 16, padding: 32 }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--fill-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-layout-dashboard" style={{ color: "var(--on-accent)", fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Syntra</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 1 }}>Admin console</div>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Sign in</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Restricted access. Admin accounts only.</div>

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--bg-danger)", border: "0.5px solid var(--border-danger)", borderRadius: "var(--radius)", marginBottom: 16 }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 14, color: "var(--text-danger)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-danger)" }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Email</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-mail" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "var(--text-muted)", pointerEvents: "none" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@syntra.ai" required
                style={{ width: "100%", height: 36, padding: "0 12px 0 34px", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)", background: "var(--surface-2)", color: "var(--text-primary)", fontSize: 13 }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Password</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-lock" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "var(--text-muted)", pointerEvents: "none" }} />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: "100%", height: 36, padding: "0 36px 0 34px", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)", background: "var(--surface-2)", color: "var(--text-primary)", fontSize: 13 }} />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}>
                <i className={`ti ${showPw ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>

          {/* Remember + forgot */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 14, height: 14, padding: 0, margin: 0 }} />
              Remember me
            </label>
            <a href="#" style={{ fontSize: 12, color: "var(--text-accent)", textDecoration: "none" }}>Forgot password?</a>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width: "100%", height: 36, borderRadius: "var(--radius)", border: "none", background: "var(--fill-accent)", color: "var(--on-accent)", fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <i className="ti ti-login" style={{ fontSize: 14 }} />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Security note */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--surface-0)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", marginTop: 20 }}>
          <i className="ti ti-shield-check" style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Access is logged. Unauthorized attempts are reported.</span>
        </div>
      </div>
    </div>
  );
}