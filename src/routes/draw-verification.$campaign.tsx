import { createFileRoute, useParams } from "@tanstack/react-router";
import { DrawVerificationPage } from "@/components/rafilla/draws";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/draw-verification/$campaign")({
  head: ({ params }) => {
    const pathname = `/draw-verification/${params.campaign}`;
    const canonical = `${canonicalBase}${pathname}`;
    const formatted = params.campaign.replaceAll("-", " ");
    const title = `Draw verification: ${formatted} — Rafilla`;
    const description =
      `Public draw verification record for ${formatted}. Published snapshot hash, NIST beacon seed, HMAC_DRBG algorithm details, and the verified winning entry. rafilla.com`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
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
  component: DrawVerificationRouteComponent,
});

function DrawVerificationRouteComponent() {
  const { campaign } = useParams({ from: "/draw-verification/$campaign" });
  return <DrawVerificationPage campaignId={campaign} />;
}
