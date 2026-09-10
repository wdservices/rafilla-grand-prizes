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
  verified?: boolean | undefined;
  tagline?: string | undefined;
  isGoogleUser?: boolean | undefined;
  profileComplete?: boolean | undefined;
};

type DefaultCredential = { email: string; password: string; user: RaffilaUser };

export const DEFAULT_CREDENTIALS: Record<UserRole, DefaultCredential> = {
  user: {
    email: "user@raffila.com",
    password: "Raffila2026!",
    user: {
      id: "usr_tunmise_adebayo_001",
      role: "user",
      firstName: "Tunmise",
      lastName: "Adebayo",
      handle: "tunmise_adebayo",
      email: "tunmise.adebayo@raffila.com",
      phone: "+234 801 234 5678",
      avatarMonogram: "TA",
      verified: true,
      tagline: "Verified Raffila player",
    },
  },
  admin: {
    email: "admin@raffila.com",
    password: "Admin2026!",
    user: {
      id: "adm_aisha_ola_001",
      role: "admin",
      firstName: "Aisha",
      lastName: "Olamide",
      handle: "admin_aisha",
      email: "aisha.olamide@raffila.com",
      phone: "+234 802 345 6789",
      avatarMonogram: "AO",
      verified: true,
      tagline: "Super admin · Raffila ops",
    },
  },
};

const STORAGE_KEY = "raffila:auth:session:v1";

export type Session = { user: RaffilaUser; createdAt: string } | null;

function readSession(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed && parsed?.user?.id ? parsed : null;
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

export function signInWithCredentials(input: { email: string; password: string }): SignInResult {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!email || !password) {
    return { ok: false, code: "invalid_input", message: "Email and password are required" };
  }

  const admin = DEFAULT_CREDENTIALS.admin;
  if (email === admin.email.toLowerCase() && password === admin.password) {
    const session: Session = { user: admin.user, createdAt: new Date().toISOString() };
    writeSession(session);
    emit(session);
    return { ok: true, user: admin.user, redirect: "/admin" };
  }

  const user = DEFAULT_CREDENTIALS.user;
  if (email === user.email.toLowerCase() && password === user.password) {
    const session: Session = { user: user.user, createdAt: new Date().toISOString() };
    writeSession(session);
    emit(session);
    return { ok: true, user: user.user, redirect: "/dashboard" };
  }

  return {
    ok: false,
    code: "invalid_credentials",
    message: "Incorrect email or password. Use the default Raffila credentials.",
  };
}

export function signInAs(role: UserRole): SignInResult {
  const cred = DEFAULT_CREDENTIALS[role];
  const session: Session = { user: cred.user, createdAt: new Date().toISOString() };
  writeSession(session);
  emit(session);
  return { ok: true, user: cred.user, redirect: role === "admin" ? "/admin" : "/dashboard" };
}

export function setFirebaseSession(user: RaffilaUser) {
  const session: Session = { user, createdAt: new Date().toISOString() };
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
    if (current && !current.user.id.startsWith("firebase_") && !current.user.id.startsWith("usr_") && !current.user.id.startsWith("adm_")) {
      return;
    }

    try {
      const profile = await getUserProfile(fbUser.uid);
      const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile ?? undefined);
      const firebaseUser: RaffilaUser = {
        ...raffilaUser,
        id: `firebase_${fbUser.uid}`,
      };

      const session: Session = { user: firebaseUser, createdAt: new Date().toISOString() };
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
  | { allowed: false; reason: "unauthenticated" | "unauthorized"; redirect: string };

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

  if (isAdminRoute && session.user.role !== "admin") {
    return { allowed: false, reason: "unauthorized", redirect: "/dashboard" };
  }
  if (isDashboardRoute && session.user.role === "admin") {
    return { allowed: false, reason: "unauthorized", redirect: "/admin" };
  }
  return { allowed: true };
}
