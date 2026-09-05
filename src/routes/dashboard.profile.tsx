import { createFileRoute } from "@tanstack/react-router";
import { DashboardProfilePage } from "@/components/rafilla/dashboard";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Rafilla" },
      {
        name: "description",
        content:
          "Manage your Rafilla profile details and verification status for smooth prize claims.",
      },
      { property: "og:title", content: "My Profile — Rafilla" },
      {
        property: "og:description",
        content:
          "Manage your Rafilla profile details and verification status for smooth prize claims.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardProfilePage,
});
