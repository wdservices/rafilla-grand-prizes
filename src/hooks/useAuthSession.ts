import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { doc, updateDoc } from "firebase/firestore";

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
  updateProfile,
  isAdminEmail,
  checkIsAdmin,
} from "@/lib/firebase-auth";
import { db } from "@/lib/firebase";
import {
  checkUsernameAvailability,
  checkEmailAvailability,
  claimUsernameAndEmail,
  normalizeUsername,
  normalizeEmail,
} from "@/lib/user-validation";

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

  const isUserAdmin = session?.user
    ? session.user.role === "admin" || checkIsAdmin(session.user.email)
    : false;
  const effectiveRole: UserRole | null = session?.user
    ? isUserAdmin
      ? "admin"
      : session.user.role
    : null;
  const effectiveUser = session?.user
    ? {
        ...session.user,
        role: isUserAdmin ? ("admin" as const) : session.user.role,
      }
    : null;

  return {
    user: effectiveUser,
    role: effectiveRole,
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
    async signIn(input: {
      email: string;
      password: string;
      remember?: boolean;
    }): Promise<SignInResult> {
      const remember = input.remember ?? true;

      // First check demo credentials
      const demoResult = signInWithCredentials({ ...input, remember });
      if (demoResult.ok) {
        if (typeof window !== "undefined") {
          if (remember) {
            window.localStorage.setItem("raffila:saved_email", input.email.trim());
            window.localStorage.setItem("raffila:remember_me", "true");
          } else {
            window.localStorage.removeItem("raffila:saved_email");
            window.localStorage.setItem("raffila:remember_me", "false");
          }
        }
        setTimeout(() => void navigate({ to: demoResult.redirect as any }), 0);
        return demoResult;
      }

      // Try Firebase Auth
      try {
        const cred = await loginWithEmail(input.email, input.password, remember);
        let profile = await getUserProfile(cred.user.uid);
        const isUserAdmin = checkIsAdmin(cred.user.email, profile);

        // Ensure admin user profile exists and has role: "admin" in Firestore
        if (isUserAdmin) {
          try {
            await createUserProfile(cred.user.uid, {
              email: cred.user.email || input.email,
              role: "admin",
              isAdmin: true,
              verified: true,
            });
            profile = { ...(profile || {}), role: "admin", isAdmin: true, verified: true };
          } catch (syncErr) {
            console.warn("Could not sync admin in Firestore:", syncErr);
          }
        }

        const raffilaUser = firebaseUserToRaffilaUser(cred.user, profile ?? {});
        const user: RaffilaUser = {
          ...raffilaUser,
          role: isUserAdmin ? "admin" : raffilaUser.role,
          id: `firebase_${cred.user.uid}`,
        };
        setFirebaseSession(user, remember);

        if (typeof window !== "undefined") {
          if (remember) {
            window.localStorage.setItem("raffila:saved_email", input.email.trim());
            window.localStorage.setItem("raffila:remember_me", "true");
          } else {
            window.localStorage.removeItem("raffila:saved_email");
            window.localStorage.setItem("raffila:remember_me", "false");
          }
        }

        const redirect = isUserAdmin ? "/admin" : "/dashboard";
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
        let profile = await getUserProfile(fbUser.uid);
        const isUserAdmin = checkIsAdmin(fbUser.email, profile);

        if (isUserAdmin) {
          try {
            await createUserProfile(fbUser.uid, {
              email: fbUser.email || "",
              role: "admin",
              isAdmin: true,
              verified: true,
            });
            profile = { ...(profile || {}), role: "admin", isAdmin: true, verified: true };
          } catch (syncErr) {
            console.warn("Could not sync admin to Firestore:", syncErr);
          }
        }

        if (!profile && !isUserAdmin) {
          // First-time Google user — needs profile completion
          const raffilaUser = firebaseUserToRaffilaUser(fbUser);
          const user: RaffilaUser = {
            ...raffilaUser,
            id: `firebase_${fbUser.uid}`,
            profileComplete: false,
          };
          setFirebaseSession(user, true);
          return { ok: true, user, redirect: "/auth?mode=complete", needsProfile: true };
        }

        // Existing user or admin
        const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile ?? undefined);
        const user: RaffilaUser = {
          ...raffilaUser,
          role: isUserAdmin ? "admin" : raffilaUser.role,
          id: `firebase_${fbUser.uid}`,
        };
        setFirebaseSession(user, true);

        const redirect = isUserAdmin ? "/admin" : "/dashboard";
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
      username: string;
      displayName?: string;
      phone?: string;
      address?: string;
      dob?: string;
    }): Promise<{ ok: true; user: RaffilaUser } | { ok: false; message: string }> {
      try {
        const cleanUsername = normalizeUsername(input.username || input.displayName || "");
        const cleanEmail = normalizeEmail(input.email);

        // Pre-validate username uniqueness
        const userCheck = await checkUsernameAvailability(cleanUsername);
        if (!userCheck.available) {
          return { ok: false, message: userCheck.error || "This username is already taken" };
        }

        // Pre-validate email uniqueness
        const emailCheck = await checkEmailAvailability(cleanEmail);
        if (!emailCheck.available) {
          return { ok: false, message: emailCheck.error || "This email is already registered" };
        }

        const cred = await registerWithEmail(cleanEmail, input.password);

        // Update native Firebase Auth profile
        try {
          await updateProfile(cred.user, { displayName: cleanUsername });
        } catch (pErr) {
          console.warn("Could not update auth display name:", pErr);
        }

        const isUserAdmin = checkIsAdmin(cleanEmail);
        await createUserProfile(cred.user.uid, {
          firstName: cleanUsername,
          lastName: "",
          handle: cleanUsername,
          displayName: cleanUsername,
          email: cleanEmail,
          phone: input.phone || "",
          address: input.address || "",
          dob: input.dob || "",
          avatarMonogram: cleanUsername.slice(0, 2).toUpperCase() || (isUserAdmin ? "AD" : "U"),
          role: isUserAdmin ? "admin" : "user",
          isAdmin: isUserAdmin,
          verified: isUserAdmin ? true : false,
        });

        // Reserve in public uniqueness collections
        await claimUsernameAndEmail({
          username: cleanUsername,
          email: cleanEmail,
          uid: cred.user.uid,
        });

        const profile = await getUserProfile(cred.user.uid);
        const raffilaUser = firebaseUserToRaffilaUser(cred.user, profile ?? {});
        const user: RaffilaUser = { ...raffilaUser, id: `firebase_${cred.user.uid}` };
        setFirebaseSession(user, true);

        if (typeof window !== "undefined") {
          window.localStorage.setItem("raffila:saved_email", cleanEmail);
          window.localStorage.setItem("raffila:remember_me", "true");
        }

        return { ok: true, user };
      } catch (err: any) {
        const message =
          err?.code === "auth/email-already-in-use"
            ? "An account with this email already exists. Please sign in instead."
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

        const chosenHandle = data.handle
          ? normalizeUsername(data.handle)
          : session.user.handle || "";
        if (chosenHandle && chosenHandle !== session.user.handle) {
          const avail = await checkUsernameAvailability(chosenHandle, uid);
          if (!avail.available) {
            return { ok: false, message: avail.error || "This username is already taken" };
          }
        }

        const isUserAdmin = checkIsAdmin(session.user.email);
        await createUserProfile(uid, {
          phone: data.phone,
          address: data.address,
          dob: data.dob,
          handle: chosenHandle,
          avatarUrl: session.user.avatarUrl || "",
          role: isUserAdmin ? "admin" : "user",
          isAdmin: isUserAdmin,
        });

        if (chosenHandle) {
          await claimUsernameAndEmail({
            username: chosenHandle,
            email: session.user.email,
            uid,
          });
        }

        const profile = await getUserProfile(uid);
        const fbUser = {
          uid,
          email: session.user.email,
          displayName: `${session.user.firstName || ""} ${session.user.lastName || ""}`,
          photoURL: session.user.avatarUrl || null,
          providerData: [{ providerId: "google.com" }],
        } as any;
        const raffilaUser = firebaseUserToRaffilaUser(fbUser, profile ?? undefined);
        const updatedUser: RaffilaUser = {
          ...raffilaUser,
          role: isUserAdmin ? "admin" : raffilaUser.role,
          id: `firebase_${uid}`,
          profileComplete: true,
        };
        setFirebaseSession(updatedUser, true);
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
