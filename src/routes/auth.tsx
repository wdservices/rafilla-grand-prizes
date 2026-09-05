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

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

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
  head: () => {
    const pathname = "/auth";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Log in or create account — Rafilla";
    const description =
      "Sign in or register your Rafilla account to start entering prize competitions, track entries, manage wallet and refer friends. Noindex private page. rafilla.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "Rafilla Grand Prizes" },
        { property: "og:image", content: ogImageDefault },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageDefault },
        { name: "twitter:site", content: "@rafillang" },
        { name: "twitter:creator", content: "@rafillang" },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hreflang: "en", href: canonical },
      ],
    };
  },
  component: AuthPage,
});
