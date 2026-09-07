import { createFileRoute } from "@tanstack/react-router";
import { CompetitionsPage } from "@/components/rafilla/public-pages";

export const Route = createFileRoute("/competitions/")({
  component: CompetitionsPage,
});
