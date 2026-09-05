import { createFileRoute } from "@tanstack/react-router";
import { FAQPage } from "@/components/rafilla/public-pages";
export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Rafilla" },
      {
        name: "description",
        content: "Find answers about Rafilla competitions, wallets, entries, referrals, and draws.",
      },
      { property: "og:title", content: "FAQ — Rafilla" },
      {
        property: "og:description",
        content: "Find answers about Rafilla competitions, wallets, entries, referrals, and draws.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FAQPage,
});
