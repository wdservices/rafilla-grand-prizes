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
  type SignInResult,
  type UserRole,
} from "@/lib/auth-store";

export function useAuthSession() {
  const [session, setSession] = useState<Session>(getSession());
  const location = useLocation();

  useEffect(() => subscribe(setSession), []);

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
      const result = signInWithCredentials(input);
      if (result.ok) {
        setTimeout(() => void navigate({ to: result.redirect as any }), 0);
      }
      return result;
    },
    async signInQuick(role: UserRole): Promise<SignInResult> {
      const result = signInAs(role);
      setTimeout(() => void navigate({ to: result.redirect as any }), 0);
      return result;
    },
    signOut(target: { to?: "/" | "/auth" } = { to: "/auth" }) {
      signOut();
      setTimeout(() => void navigate({ to: target.to as any }), 0);
    },
  };
}

export function initialsOf(user: RaffilaUser | { firstName: string; lastName: string }) {
  return (user.firstName.slice(0, 1) + user.lastName.slice(0, 1)).toUpperCase();
}
