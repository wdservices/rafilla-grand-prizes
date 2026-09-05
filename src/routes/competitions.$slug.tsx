import { createFileRoute } from "@tanstack/react-router";
import { CompetitionDetailPage } from "@/components/rafilla/public-pages";
import { getCompetition } from "@/lib/rafilla-data";

export const Route = createFileRoute("/competitions/$slug")({
  head: ({ params }) => {
    const competition = getCompetition(params.slug);
    const title = competition
      ? `${competition.title} — Rafilla`
      : "Competition unavailable — Rafilla";
    const description = competition?.description ?? "Explore Rafilla competition details.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CompetitionDetailPage,
});
