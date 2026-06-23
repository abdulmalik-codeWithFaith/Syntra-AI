// lib/firebase/client.ts
// Client-side Firebase SDK — safe to use in "use client" components.

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// ─── Env validation ───────────────────────────────────────────────────────────
// Gives a clear dev error instead of the cryptic Firebase "invalid-api-key" message.

const REQUIRED_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

if (typeof window !== "undefined") {
  const missing = REQUIRED_VARS.filter(
    (key) => !process.env[key] || process.env[key]!.includes("your_")
  );
  if (missing.length > 0) {
    throw new Error(
      `\n\n🔴 Syntra: Missing Firebase environment variables:\n` +
        missing.map((k) => `   • ${k}`).join("\n") +
        `\n\n→ Create a .env.local file in your project root and add the missing values.` +
        `\n→ Get them from: Firebase Console → Project Settings → Your Apps → Web App → Config` +
        `\n→ Then restart your dev server: Ctrl+C → npm run dev\n`
    );
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ─── Singleton ────────────────────────────────────────────────────────────────
// Prevents re-initializing on every Next.js hot reload.

const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;