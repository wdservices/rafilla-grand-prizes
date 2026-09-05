import { createFileRoute } from "@tanstack/react-router";
import { CompetitionRulesPage } from "@/components/rafilla/public-pages";
export const Route = createFileRoute("/competition-rules")({
  head: () => ({
    meta: [
      { title: "Competition Rules — Rafilla" },
      {
        name: "description",
        content:
          "Official rules for Rafilla prize competitions including entry, draws, winners, prizes, refunds, and final decisions.",
      },
      { property: "og:title", content: "Competition Rules — Rafilla" },
      {
        property: "og:description",
        content:
          "Official rules for Rafilla prize competitions including entry, draws, winners, prizes, refunds, and final decisions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompetitionRulesPage,
});
