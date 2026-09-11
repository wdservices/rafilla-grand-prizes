import {
  onAuthChange,
  getUserProfile,
  createUserProfile,
  firebaseUserToRaffilaUser,
  checkIsAdmin,
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

export function signInWithCredentials(input: {
  email: string;
  password: string;
  remember?: boolean;
}): SignInResult {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const remember = input.remember ?? true;
  const expiresAt = Date.now() + (remember ? REMEMBER_ME_MS : 24 * 60 * 60 * 1000);

  if (!email || !password) {
    return { ok: false, code: "invalid_input", message: "Email and password are required" };
  }

  const admin = DEFAULT_CREDENTIALS.admin;
  if (email === admin.email.toLowerCase() && password === admin.password) {
    const session: Session = {
      user: admin.user,
      createdAt: new Date().toISOString(),
      expiresAt,
      remember,
    };
    writeSession(session);
    emit(session);
    return { ok: true, user: admin.user, redirect: "/admin" };
  }

  const user = DEFAULT_CREDENTIALS.user;
  if (email === user.email.toLowerCase() && password === user.password) {
    const session: Session = {
      user: user.user,
      createdAt: new Date().toISOString(),
      expiresAt,
      remember,
    };
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
  const session: Session = {
    user: cred.user,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + REMEMBER_ME_MS,
    remember: true,
  };
  writeSession(session);
  emit(session);
  return { ok: true, user: cred.user, redirect: role === "admin" ? "/admin" : "/dashboard" };
}

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
      let profile = await getUserProfile(fbUser.uid);
      const isUserAdmin = checkIsAdmin(fbUser.email, profile);

      // If user is admin but doc is missing or missing role: "admin", sync it to Firestore
      if (isUserAdmin && (!profile || profile["role"] !== "admin")) {
        try {
          await createUserProfile(fbUser.uid, {
            email: fbUser.email || "",
            role: "admin",
            isAdmin: true,
            verified: true,
          });
          profile = { ...(profile || {}), role: "admin", isAdmin: true };
        } catch (syncErr) {
          console.warn("Could not sync admin status to Firestore:", syncErr);
        }
      }

      const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile ?? undefined);
      const firebaseUser: RaffilaUser = {
        ...raffilaUser,
        role: isUserAdmin ? "admin" : raffilaUser.role,
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

  const isUserAdmin = session.user.role === "admin" || checkIsAdmin(session.user.email);

  // Self-heal stale session if role was stored as user
  if (isUserAdmin && session.user.role !== "admin") {
    session.user.role = "admin";
    writeSession(session);
    emit(session);
  }

  if (isAdminRoute && !isUserAdmin) {
    return { allowed: false, reason: "unauthorized", redirect: "/dashboard" };
  }
  if (isDashboardRoute && isUserAdmin) {
    return { allowed: false, reason: "unauthorized", redirect: "/admin" };
  }
  return { allowed: true };
}
