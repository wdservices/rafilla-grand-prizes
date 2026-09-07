import { createFileRoute } from "@tanstack/react-router";
import { PartnerAnalyticsPage } from "@/components/rafilla/partner";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/partner/analytics")({
  head: () => {
    const pathname = "/partner/analytics";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Analytics — Partner · Rafilla";
    const description =
      "Private partner analytics: ticket sales velocity, entries per listing, revenue split, audience geo, conversion rates and 30/90-day performance dashboards for Rafilla prize partners. rafilla.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "Rafilla Grand Prizes" },
        { property: "og:image", content: ogImageDefault },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageDefault },
        { name: "twitter:site", content: "@rafillang" },
        { name: "twitter:creator", content: "@rafillang" },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: PartnerAnalyticsPage,
});
