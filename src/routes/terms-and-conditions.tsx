import { createFileRoute } from "@tanstack/react-router";
import { TermsAndConditionsPage } from "@/components/rafilla/public-pages";
export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Rafilla" },
      {
        name: "description",
        content:
          "Read Rafilla's terms and conditions covering competitions, entries, draws, wallet usage, and user responsibilities.",
      },
      { property: "og:title", content: "Terms and Conditions — Rafilla" },
      {
        property: "og:description",
        content:
          "Read Rafilla's terms and conditions covering competitions, entries, draws, wallet usage, and user responsibilities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsAndConditionsPage,
});
