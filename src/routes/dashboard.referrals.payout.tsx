import { createFileRoute } from "@tanstack/react-router";
import { DashboardReferralsPayoutPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/referrals/payout")({
  head: () => ({
    meta: [
      { title: "Request Payout — Rafilla" },
      {
        name: "description",
          content:
            "Request a bank payout for your available Rafilla referral earnings and view payout history.",
      },
      { property: "og:title", content: "Request Payout — Rafilla" },
      {
        property: "og:description",
        content:
          "Request a bank payout for your available Rafilla referral earnings and view payout history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardReferralsPayoutPage,
});
