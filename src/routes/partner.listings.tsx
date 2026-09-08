import { createFileRoute } from "@tanstack/react-router";
import { PartnerListingsPage } from "@/components/raffila/partner";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/partner/listings")({
  head: () => {
    const pathname = "/partner/listings";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "My listings — Partner · Raffila";
    const description =
      "Manage your prize listings: track live draws, ticket sales, entry counts, draw dates, edit asset descriptions and control published status across your Raffila competition catalogue. raffila.com";
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
  component: PartnerListingsPage,
});
