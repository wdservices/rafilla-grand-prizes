import { createFileRoute } from "@tanstack/react-router";
import { PartnerAnalyticsPage } from "@/components/raffila/partner";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/partner/analytics")({
  head: () => {
    const pathname = "/partner/analytics";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Analytics — Partner · Raffila";
    const description =
      "Private partner analytics: ticket sales velocity, entries per listing, revenue split, audience geo, conversion rates and 30/90-day performance dashboards for Raffila prize partners. raffila.com";
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
  component: PartnerAnalyticsPage,
});
