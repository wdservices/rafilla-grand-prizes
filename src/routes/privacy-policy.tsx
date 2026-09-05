import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "@/components/rafilla/public-pages";
export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Rafilla" },
      {
        name: "description",
        content:
          "Learn how Rafilla collects, uses, secures, and shares personal information for competition entrants and account holders.",
      },
      { property: "og:title", content: "Privacy Policy — Rafilla" },
      {
        property: "og:description",
        content:
          "Learn how Rafilla collects, uses, secures, and shares personal information for competition entrants and account holders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPolicyPage,
});
