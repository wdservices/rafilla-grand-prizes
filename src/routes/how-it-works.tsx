import { createFileRoute } from "@tanstack/react-router";
import { HowItWorksPage } from "@/components/rafilla/public-pages";
export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Rafilla Works" },
      {
        name: "description",
        content: "See how Rafilla competitions, entries, and verifiable draws work.",
      },
      { property: "og:title", content: "How Rafilla Works" },
      {
        property: "og:description",
        content: "See how Rafilla competitions, entries, and verifiable draws work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});
