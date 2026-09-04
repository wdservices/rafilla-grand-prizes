import { createFileRoute } from "@tanstack/react-router";
import { CompetitionsPage } from "@/components/rafilla/public-pages";

export const Route = createFileRoute("/competitions")({
  head: () => ({ meta: [
    { title: "Competitions — Rafilla" },
    { name: "description", content: "Browse Rafilla's premium prize competitions with clear entry prices, progress, and closing dates." },
    { property: "og:title", content: "Competitions — Rafilla" },
    { property: "og:description", content: "Browse Rafilla's premium prize competitions with clear entry prices, progress, and closing dates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CompetitionsPage,
});