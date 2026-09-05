import { createFileRoute } from "@tanstack/react-router";
import { DrawVerificationPage } from "@/components/rafilla/public-pages";
export const Route = createFileRoute("/draw-verification/$campaign")({
  head: ({ params }) => ({
    meta: [
      { title: `Draw Verification — ${params.campaign} — Rafilla` },
      {
        name: "description",
        content: "Review public draw verification information for a Rafilla competition.",
      },
      { property: "og:title", content: "Draw Verification — Rafilla" },
      {
        property: "og:description",
        content: "Review public draw verification information for a Rafilla competition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DrawVerificationPage,
});
