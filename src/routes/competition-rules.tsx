import { createFileRoute } from "@tanstack/react-router";
import { CompetitionRulesPage } from "@/components/rafilla/public-pages";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/competition-rules")({
  head: () => {
    const pathname = "/competition-rules";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Competition rules — Entry, draws, claims, refunds · Rafilla";
    const description =
      "Official Rafilla competition rules: entry eligibility, ticket limits, draw process HMAC_DRBG, winner selection, prize claims (14 days), refunds, disqualification and dispute resolution. rafilla.com";

    const rulesArticleJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      author: {
        "@type": "Organization",
        name: "Rafilla Grand Prizes",
        url: canonicalBase,
      },
      publisher: {
        "@type": "Organization",
        name: "Rafilla Grand Prizes",
        url: canonicalBase,
      },
      datePublished: "2025-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      mainEntityOfPage: canonical,
      image: ogImageDefault,
    });

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
        { "data-head-children": true, __html: `<script type="application/ld+json">${rulesArticleJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hreflang: "en", href: canonical },
      ],
    };
  },
  component: CompetitionRulesPage,
});
