import { createFileRoute } from "@tanstack/react-router";
import { PartnerProfilePage } from "@/components/rafilla/partner";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/partner/profile")({
  head: () => {
    const pathname = "/partner/profile";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Partner profile — Partner · Rafilla";
    const description =
      "Partner organisation profile: company details, registered address, bank settlement account info, KYC documentation upload, tax ID and primary contact manager for Rafilla prize partners. rafilla.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
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
        { rel: "alternate", hreflang: "en", href: canonical },
      ],
    };
  },
  component: PartnerProfilePage,
});
