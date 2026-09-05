import { createFileRoute } from "@tanstack/react-router";
import { DashboardWalletPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Rafilla" },
      {
        name: "description",
        content:
          "Fund your Rafilla Wallet, top up securely, and track every naira spent on competition entries.",
      },
      { property: "og:title", content: "Wallet — Rafilla" },
      {
        property: "og:description",
        content:
          "Fund your Rafilla Wallet, top up securely, and track every naira spent on competition entries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardWalletPage,
});
