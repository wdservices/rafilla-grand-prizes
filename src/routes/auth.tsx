import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  AuthShell,
  AuthTabs,
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  OTPVerifyForm,
  CompleteProfileForm,
} from "@/components/rafilla/auth";
import type { AuthTab } from "@/components/rafilla/auth/tabs";

type AuthMode = "forgot" | "otp" | "complete";

function AuthPage() {
  const search = Route.useSearch() as Record<string, unknown>;
  const rawMode = search["mode"];
  const mode = (rawMode === "forgot" || rawMode === "otp" || rawMode === "complete")
    ? (rawMode as AuthMode)
    : undefined;

  const [tab, setTab] = useState<AuthTab>("login");

  let variant: "login" | "register" | "forgot" | "otp" | "complete" = "login";
  let body;

  if (mode === "forgot") {
    variant = "forgot";
    body = <ForgotPasswordForm />;
  } else if (mode === "otp") {
    variant = "otp";
    body = <OTPVerifyForm />;
  } else if (mode === "complete") {
    variant = "complete";
    body = <CompleteProfileForm />;
  } else {
    variant = tab;
    body = (
      <div className="space-y-6">
        <AuthTabs activeTab={tab} onTabChange={setTab} defaultTab="login" />
        <div
          role="tabpanel"
          id={`auth-panel-${tab}`}
          aria-labelledby={`auth-tab-${tab}`}
          className="raf-rise"
          key={tab}
        >
          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    );
  }

  return <AuthShell variant={variant}>{body}</AuthShell>;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in / Sign up — Rafilla" },
      { name: "description", content: "Log in or create your Rafilla account to enter premium prize competitions with fair, verified draws." },
      { property: "og:title", content: "Log in / Sign up — Rafilla" },
      { property: "og:description", content: "Log in or create your Rafilla account to enter premium prize competitions with fair, verified draws." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});
