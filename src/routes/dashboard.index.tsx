import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverviewPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard Overview — Rafilla" },
      {
        name: "description",
        content:
          "Your Rafilla dashboard — wallet, entries, referrals, and account overview at a glance.",
      },
      { property: "og:title", content: "Dashboard Overview — Rafilla" },
      {
        property: "og:description",
        content:
          "Your Rafilla dashboard — wallet, entries, referrals, and account overview at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardOverviewPage,
});
