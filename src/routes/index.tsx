import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/rafilla/public-pages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rafilla — Big Prizes. Fair Chances." },
      {
        name: "description",
        content:
          "Discover premium prize competitions, secure your entries, and follow every draw with confidence.",
      },
      { property: "og:title", content: "Rafilla — Big Prizes. Fair Chances." },
      {
        property: "og:description",
        content:
          "Discover premium prize competitions, secure your entries, and follow every draw with confidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
