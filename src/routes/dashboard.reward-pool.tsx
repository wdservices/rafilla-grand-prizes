import { createFileRoute } from "@tanstack/react-router";
import { DashboardRewardPoolPage } from "@/components/raffila/dashboard";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/dashboard/reward-pool")({
  head: () => {
    const pathname = "/dashboard/reward-pool";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Community reward pool — Raffila";
    const description =
      "Private page: track community reward pool growth, upcoming prize drops, top referrers leaderboard, and your share of the pool. Noindex user area. raffila.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "Raffila" },
        { property: "og:image", content: ogImageDefault },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageDefault },
        { name: "twitter:site", content: "@raffilang" },
        { name: "twitter:creator", content: "@raffilang" },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: DashboardRewardPoolPage,
});
