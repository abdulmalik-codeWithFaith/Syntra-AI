"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import type { UserDoc } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;

  // Auth actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const googleProvider = new GoogleAuthProvider();

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Prevents the auth listener from racing against signUpWithEmail's
  // createUserDocument call — the doc may not exist yet when the listener fires
  const skipListenerFetch = useRef(false);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser && !skipListenerFetch.current) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(docRef);
        setUserDoc(snap.exists() ? (snap.data() as UserDoc) : null);
      } else if (!firebaseUser) {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  async function createUserDocument(user: User, fullName: string) {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      const newUser: Omit<UserDoc, "createdAt" | "updatedAt"> & {
        createdAt: ReturnType<typeof serverTimestamp>;
        updatedAt: ReturnType<typeof serverTimestamp>;
      } = {
        uid: user.uid,
        email: user.email ?? "",
        fullName,
        photoURL: user.photoURL ?? undefined,
        workspaceIds: [],
        currentWorkspaceId: "",
        onboardingComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, newUser);
    }
  }

  function redirectAfterAuth(doc: UserDoc | null) {
    if (!doc || !doc.onboardingComplete) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard/overview");
    }
  }

  // ─── Auth actions ──────────────────────────────────────────────────────────

  async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const docRef = doc(db, "users", result.user.uid);
    const snap = await getDoc(docRef);
    const userData = snap.exists() ? (snap.data() as UserDoc) : null;
    setUserDoc(userData);
    redirectAfterAuth(userData);
  }

  async function signUpWithEmail(email: string, password: string, fullName: string) {
    // Block the auth listener from reading Firestore before the doc is written
    skipListenerFetch.current = true;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: fullName });
    await createUserDocument(result.user, fullName);
    skipListenerFetch.current = false;
    router.push("/onboarding");
  }

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const fullName = result.user.displayName ?? result.user.email ?? "User";
    await createUserDocument(result.user, fullName);
    const docRef = doc(db, "users", result.user.uid);
    const snap = await getDoc(docRef);
    const userData = snap.exists() ? (snap.data() as UserDoc) : null;
    setUserDoc(userData);
    redirectAfterAuth(userData);
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setUserDoc(null);
    router.push("/login");
  }

  async function resetPassword(email: string) {
    // Use the currently signed-in user's display name if available,
    // otherwise fall back to the email prefix
    const fullName = user?.displayName ?? email.split("@")[0];

    await fetch("/api/email/send-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName }),
    });
  }

  // ─── Value ────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}