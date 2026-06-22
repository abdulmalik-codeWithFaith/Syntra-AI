// lib/firebase/admin.ts
// Server-side Firebase Admin SDK — NEVER import this in client components
// Use only in: API routes (app/api/**), Server Components, Server Actions

import {
  initializeApp,
  getApps,
  cert,
  App,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// ─── Singleton initialization ──────────────────────────────────────────────────

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    // The private key comes from .env with literal \n — replace them for proper line breaks
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  };

  return initializeApp({ credential: cert(serviceAccount) });
}

const adminApp: App = getAdminApp();

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);

export default adminApp;