import { createFileRoute } from "@tanstack/react-router";
import { DashboardSecurityPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({
    meta: [
      { title: "Security — Rafilla" },
      {
        name: "description",
        content:
          "Protect your Rafilla account with password changes, 2FA, and active session controls.",
      },
      { property: "og:title", content: "Security — Rafilla" },
      {
        property: "og:description",
        content:
          "Protect your Rafilla account with password changes, 2FA, and active session controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardSecurityPage,
});
