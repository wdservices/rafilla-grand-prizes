import { createFileRoute } from "@tanstack/react-router";
import { DashboardReferralsPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals — Rafilla" },
      {
        name: "description",
        content:
          "Share your Rafilla referral code, track your 5-level tree, and grow commission earnings.",
      },
      { property: "og:title", content: "Referrals — Rafilla" },
      {
        property: "og:description",
        content:
          "Share your Rafilla referral code, track your 5-level tree, and grow commission earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardReferralsPage,
});
