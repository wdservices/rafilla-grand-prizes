import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import type { RaffilaUser, Session } from "@/lib/auth-store";
import {
  canAccessRoute,
  getSession,
  signInAs,
  signInWithCredentials,
  signOut,
  subscribe,
  initFirebaseAuthListener,
  setFirebaseSession,
  type SignInResult,
  type UserRole,
} from "@/lib/auth-store";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutFirebase,
  getUserProfile,
  createUserProfile,
  firebaseUserToRaffilaUser,
} from "@/lib/firebase-auth";

export function useAuthSession() {
  const [session, setSession] = useState<Session>(getSession());
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribe(setSession);
    const unsubFirebase = initFirebaseAuthListener();
    return () => {
      unsub();
      unsubFirebase();
    };
  }, []);

  return {
    user: session?.user ?? null,
    role: session?.user.role ?? null,
    isAuthenticated: !!session,
    session,
  };
}

export function useAuthGate() {
  const { user, isAuthenticated } = useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const gate = canAccessRoute({ pathname: location.pathname });
    if (gate.allowed) return;
    void navigate({ to: gate.redirect });
  }, [user?.id, user?.role, isAuthenticated, location.pathname, navigate]);
}

export function useAuthActions() {
  const navigate = useNavigate();

  return {
    async signIn(input: { email: string; password: string }): Promise<SignInResult> {
      // First check demo credentials
      const demoResult = signInWithCredentials(input);
      if (demoResult.ok) {
        setTimeout(() => void navigate({ to: demoResult.redirect as any }), 0);
        return demoResult;
      }

      // Try Firebase Auth
      try {
        const cred = await loginWithEmail(input.email, input.password);
        const profile = await getUserProfile(cred.user.uid);
        const raffilaUser = firebaseUserToRaffilaUser(cred.user, profile ?? {});
        const user: RaffilaUser = { ...raffilaUser, id: `firebase_${cred.user.uid}` };
        setFirebaseSession(user);

        const redirect = user.role === "admin" ? "/admin" : "/dashboard";
        setTimeout(() => void navigate({ to: redirect as any }), 0);
        return { ok: true, user, redirect };
      } catch (err: any) {
        const message =
          err?.code === "auth/user-not-found"
            ? "No account found with this email"
            : err?.code === "auth/wrong-password"
              ? "Incorrect password"
              : err?.code === "auth/invalid-credential"
                ? "Invalid email or password"
                : err?.message || "Login failed";
        return { ok: false, code: "invalid_credentials", message };
      }
    },

    async signInQuick(role: UserRole): Promise<SignInResult> {
      const result = signInAs(role);
      if (result.ok) {
        setTimeout(() => void navigate({ to: result.redirect as any }), 0);
      }
      return result;
    },

    async signInWithGoogle(): Promise<
      | { ok: true; user: RaffilaUser; redirect: string; needsProfile: boolean }
      | { ok: false; message: string }
    > {
      try {
        const result = await loginWithGoogle();
        const fbUser = result.user;
        const profile = await getUserProfile(fbUser.uid);

        if (!profile) {
          // First-time Google user — needs profile completion
          const raffilaUser = firebaseUserToRaffilaUser(fbUser);
          const user: RaffilaUser = {
            ...raffilaUser,
            id: `firebase_${fbUser.uid}`,
            profileComplete: false,
          };
          setFirebaseSession(user);
          return { ok: true, user, redirect: "/auth?mode=complete", needsProfile: true };
        }

        // Existing user
        const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile);
        const user: RaffilaUser = { ...raffilaUser, id: `firebase_${fbUser.uid}` };
        setFirebaseSession(user);

        const redirect = user.role === "admin" ? "/admin" : "/dashboard";
        setTimeout(() => void navigate({ to: redirect as any }), 0);
        return { ok: true, user, redirect, needsProfile: false };
      } catch (err: any) {
        if (err?.code === "auth/popup-closed-by-user") {
          return { ok: false, message: "Sign-in cancelled" };
        }
        return { ok: false, message: err?.message || "Google sign-in failed" };
      }
    },

    async registerWithFirebase(input: {
      email: string;
      password: string;
      displayName: string;
      phone?: string;
      address?: string;
      dob?: string;
    }): Promise<{ ok: true; user: RaffilaUser } | { ok: false; message: string }> {
      try {
        const cred = await registerWithEmail(input.email, input.password);
        const [firstName, ...rest] = input.displayName.split(" ");
        const lastName = rest.join(" ") || "";
        const handle = (input.email.split("@")[0] || "").replace(/[^a-zA-Z0-9_.]/g, "_");

        await createUserProfile(cred.user.uid, {
          firstName: firstName || "",
          lastName,
          handle,
          email: input.email,
          phone: input.phone || "",
          address: input.address || "",
          dob: input.dob || "",
          avatarMonogram: ((firstName || "") + lastName).toUpperCase() || "U",
          role: "user",
          verified: false,
        });

        const profile = await getUserProfile(cred.user.uid);
        const raffilaUser = firebaseUserToRaffilaUser(cred.user, profile ?? {});
        const user: RaffilaUser = { ...raffilaUser, id: `firebase_${cred.user.uid}` };
        setFirebaseSession(user);
        return { ok: true, user };
      } catch (err: any) {
        const message =
          err?.code === "auth/email-already-in-use"
            ? "An account with this email already exists"
            : err?.code === "auth/weak-password"
              ? "Password must be at least 6 characters"
              : err?.message || "Registration failed";
        return { ok: false, message };
      }
    },

    async completeGoogleProfile(data: {
      phone: string;
      address: string;
      dob: string;
      handle?: string;
    }): Promise<{ ok: true } | { ok: false; message: string }> {
      try {
        const session = getSession();
        if (!session?.user?.id?.startsWith("firebase_")) {
          return { ok: false, message: "No active Firebase session" };
        }
        const uid = session.user.id.replace("firebase_", "");
        await createUserProfile(uid, {
          phone: data.phone,
          address: data.address,
          dob: data.dob,
          handle: data.handle || session.user.handle,
          avatarUrl: session.user.avatarUrl || "",
        });

        const profile = await getUserProfile(uid);
        const fbUser = { uid, email: session.user.email, displayName: `${session.user.firstName || ""} ${session.user.lastName || ""}`, photoURL: session.user.avatarUrl || null, providerData: [{ providerId: "google.com" }] } as any;
        const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile ?? undefined);
        const updatedUser: RaffilaUser = { ...raffilaUser, id: `firebase_${uid}`, profileComplete: true };
        setFirebaseSession(updatedUser);
        return { ok: true };
      } catch (err: any) {
        return { ok: false, message: err?.message || "Failed to save profile" };
      }
    },

    signOut(target: { to?: "/" | "/auth" } = { to: "/auth" }) {
      logoutFirebase().catch(() => {});
      signOut();
      setTimeout(() => void navigate({ to: target.to as any }), 0);
    },
  };
}

export function initialsOf(user: RaffilaUser | { firstName: string; lastName: string }) {
  return (user.firstName.slice(0, 1) + user.lastName.slice(0, 1)).toUpperCase();
}
