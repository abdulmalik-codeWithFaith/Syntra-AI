"use client";

import { useState, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Enter a valid email address";
    }
    if (!formData.password) {
      next.password = "Password is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: connect to Firebase Auth — signInWithEmailAndPassword
      // On success: check if user has completed onboarding
      //   - if not -> router.push("/onboarding")
      //   - if yes -> router.push("/dashboard/overview")
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Sign in:", formData);
    } catch {
      setErrors({ general: "Incorrect email or password. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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

        .btn-google {
          transition: all 0.15s ease;
        }
        .btn-google:hover {
          border-color: #D1D5DB;
          background: #F9FAFB;
        }

        .card-border-glow {
          box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.15), 0 24px 60px -16px rgba(124, 58, 237, 0.18);
        }

        .checkbox-custom {
          appearance: none;
          -webkit-appearance: none;
          width: 17px;
          height: 17px;
          border: 1.5px solid #D1D5DB;
          border-radius: 5px;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .checkbox-custom:checked {
          background: #7C3AED;
          border-color: #7C3AED;
        }
        .checkbox-custom:checked::after {
          content: '';
          position: absolute;
          left: 4.5px;
          top: 0.5px;
          width: 5px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
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

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Log in to your Syntra AI account</p>
        </div>

        {/* General error */}
        {errors.general && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        {/* Google */}
        <button
          type="button"
          className="btn-google w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 mb-5 text-gray-700 font-medium text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`syntra-input w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ${errors.email ? "error" : "border-gray-200"}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <a href="/forgot-password" className="text-xs font-medium" style={{ color: "#7C3AED" }}>
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={`syntra-input w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 ${errors.password ? "error" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => updateField("rememberMe", e.target.checked)}
              className="checkbox-custom"
            />
            <span className="text-sm text-gray-500">Remember me for 30 days</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-violet w-full text-white font-semibold text-sm rounded-xl py-3.5 mt-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-7">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-semibold" style={{ color: "#7C3AED" }}>
            Sign up free
          </a>
        </p>
      </div>
    </div>
  );
}