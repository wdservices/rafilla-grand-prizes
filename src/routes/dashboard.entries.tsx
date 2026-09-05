import { createFileRoute } from "@tanstack/react-router";
import { DashboardEntriesPage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/entries")({
  head: () => ({
    meta: [
      { title: "My Entries — Rafilla" },
      {
        name: "description",
        content:
          "Track every ticket you've purchased across live and completed Rafilla competitions.",
      },
      { property: "og:title", content: "My Entries — Rafilla" },
      {
        property: "og:description",
        content:
          "Track every ticket you've purchased across live and completed Rafilla competitions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardEntriesPage,
});
