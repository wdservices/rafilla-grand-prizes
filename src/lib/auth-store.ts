import {
  onAuthChange,
  getUserProfile,
  firebaseUserToRaffilaUser,
  type FirebaseUser,
} from "./firebase-auth";

export type UserRole = "user" | "admin";

export type RaffilaUser = {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  handle?: string | undefined;
  email: string;
  phone: string;
  avatarMonogram: string;
  avatarUrl?: string | undefined;
  verified?: boolean | undefined;
  tagline?: string | undefined;
  isGoogleUser?: boolean | undefined;
  profileComplete?: boolean | undefined;
};

const STORAGE_KEY = "raffila:auth:session:v1";
export const REMEMBER_ME_DAYS = 30;
export const REMEMBER_ME_MS = 30 * 24 * 60 * 60 * 1000;

export type Session = {
  user: RaffilaUser;
  createdAt: string;
  expiresAt?: number;
  remember?: boolean;
} | null;

function readSession(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed || !parsed?.user?.id) return null;

    // Check expiration if set
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: Session) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}

let inMemorySession: Session = readSession();
type Listener = (s: Session) => void;
const listeners = new Set<Listener>();

function emit(s: Session) {
  inMemorySession = s;
  listeners.forEach((l) => l(s));
}

export type SignInResult =
  | { ok: true; user: RaffilaUser; redirect: string }
  | { ok: false; code: "invalid_credentials" | "invalid_input"; message: string };

export function setFirebaseSession(user: RaffilaUser, remember = true) {
  const expiresAt = Date.now() + (remember ? REMEMBER_ME_MS : 24 * 60 * 60 * 1000);
  const session: Session = {
    user,
    createdAt: new Date().toISOString(),
    expiresAt,
    remember,
  };
  writeSession(session);
  emit(session);
}

export function signOut() {
  writeSession(null);
  emit(null);
}

export function getSession(): Session {
  return inMemorySession;
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(inMemorySession);
  return () => listeners.delete(listener);
}

let firebaseUnsubscribe: (() => void) | null = null;

export function initFirebaseAuthListener() {
  if (firebaseUnsubscribe) return firebaseUnsubscribe;

  firebaseUnsubscribe = onAuthChange(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      const current = getSession();
      if (current && current.user.id.startsWith("firebase_")) {
        signOut();
      }
      return;
    }

    // Skip if session was set by demo credentials
    const current = getSession();
    if (
      current &&
      !current.user.id.startsWith("firebase_") &&
      !current.user.id.startsWith("usr_") &&
      !current.user.id.startsWith("adm_")
    ) {
      return;
    }

    try {
      const profile = await getUserProfile(fbUser.uid);

      // Role comes solely from the Firestore user document.
      const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile ?? undefined);
      const firebaseUser: RaffilaUser = {
        ...raffilaUser,
        id: `firebase_${fbUser.uid}`,
      };

      const remember =
        current?.remember ??
        (typeof window !== "undefined" &&
          window.localStorage.getItem("raffila:remember_me") === "true");
      const expiresAt = Date.now() + (remember ? REMEMBER_ME_MS : 24 * 60 * 60 * 1000);

      const session: Session = {
        user: firebaseUser,
        createdAt: new Date().toISOString(),
        expiresAt,
        remember,
      };
      writeSession(session);
      emit(session);
    } catch (err) {
      console.error("Failed to load Firebase user profile:", err);
    }
  });

  return firebaseUnsubscribe;
}

type AuthGateResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "unauthenticated" | "unauthorized";
      redirect: string;
      search?: Record<string, string>;
    };

export function canAccessRoute(input: { pathname: string }): AuthGateResult {
  const session = getSession();
  const isAdminRoute = input.pathname === "/admin" || input.pathname.startsWith("/admin/");
  const isDashboardRoute =
    input.pathname === "/dashboard" || input.pathname.startsWith("/dashboard/");
  const isPartnerRoute = input.pathname === "/partner" || input.pathname.startsWith("/partner/");

  if (!isAdminRoute && !isDashboardRoute && !isPartnerRoute) {
    return { allowed: true };
  }

  if (!session) {
    return { allowed: false, reason: "unauthenticated", redirect: "/auth" };
  }

  // Users who signed up with Google but never finished registration
  // must complete their profile before entering the app.
  if (session.user.profileComplete === false) {
    return {
      allowed: false,
      reason: "unauthorized",
      redirect: "/auth",
      search: { mode: "complete" },
    };
  }

  // Admin access is determined solely by the session role,
  // which comes from the Firestore `users/{uid}` document.
  const isUserAdmin = session.user.role === "admin";

  if (isAdminRoute && !isUserAdmin) {
    return { allowed: false, reason: "unauthorized", redirect: "/dashboard" };
  }
  if (isDashboardRoute && isUserAdmin) {
    return { allowed: false, reason: "unauthorized", redirect: "/admin" };
  }
  return { allowed: true };
}
