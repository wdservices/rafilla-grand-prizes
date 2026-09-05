import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/rafilla/public-pages";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/about")({
  head: () => {
    const pathname = "/about";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "About us — Fair draws, real prizes, Nigeria-built · Rafilla";
    const description =
      "About Rafilla Grand Prizes — a Nigerian prize competition platform dedicated to fair, publicly verifiable draws, premium prizes, and transparent delivery. rafilla.com";

    const aboutArticleJsonLd = JSON.stringify({
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
      articleBody:
        "Rafilla Grand Prizes is Nigeria's most trusted premium prize competition platform with publicly verifiable draws, HMAC_DRBG algorithm, insured prizes, and happy winners across the nation.",
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
        { "data-head-children": true, __html: `<script type="application/ld+json">${aboutArticleJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hreflang: "en", href: canonical },
      ],
    };
  },
  component: AboutPage,
});
