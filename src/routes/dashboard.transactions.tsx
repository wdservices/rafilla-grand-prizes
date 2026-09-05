import { createFileRoute } from "@tanstack/react-router";
import { DashboardTransactionsPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Rafilla" },
      {
        name: "description",
        content:
          "Full audit trail of wallet activity and referral commissions on your Rafilla account.",
      },
      { property: "og:title", content: "Transactions — Rafilla" },
      {
        property: "og:description",
        content:
          "Full audit trail of wallet activity and referral commissions on your Rafilla account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardTransactionsPage,
});
