import { createFileRoute } from "@tanstack/react-router";
import { TrustSafetyPage } from "@/components/raffila/public-pages";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/trust-safety")({
  head: () => {
    const pathname = "/trust-safety";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Trust & Safety — Verified prizes, secure payments, verifiable draws · Raffila";
    const description =
      "How Raffila verifies prizes and partners, secures payments, runs publicly verifiable draws, and delivers prizes to winners. raffila.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "Raffila" },
        { property: "og:image", content: ogImageDefault },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageDefault },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: TrustSafetyPage,
});
