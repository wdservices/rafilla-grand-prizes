import { createFileRoute } from "@tanstack/react-router";
import { WinnersPage } from "@/components/raffila/public-pages";
import { winnerCards } from "@/lib/raffila-data";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/winners")({
  head: () => {
    const pathname = "/winners";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Verified winners — Real prizes, real people · Raffila";
    const description =
      "See all verified Raffila competition winners with full draw verification. Real prizes delivered to real winners across Africa across Lagos, Abuja, PH and beyond. raffila.com";

    const personList = winnerCards.map((w) => ({
      "@type": "Person",
      name: w.winnerName,
      award: {
        "@type": "Award",
        name: w.prize,
        description: `${w.competition} — won ${w.amount}`,
        awardDate: w.drawDate,
        sponsor: {
          "@type": "Organization",
          name: "Raffila",
        },
      },
      image: w.image,
      address: {
        "@type": "PostalAddress",
        addressLocality: w.location,
        addressCountry: "NG",
      },
    }));
    const winnerListJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: personList.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: p,
      })),
      numberOfItems: personList.length,
      name: "Raffila Verified Winners",
    });

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
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageDefault },
        { name: "twitter:site", content: "@raffilang" },
        { name: "twitter:creator", content: "@raffilang" },
        { "data-head-children": true, __html: `<script type="application/ld+json">${winnerListJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: WinnersPage,
});
