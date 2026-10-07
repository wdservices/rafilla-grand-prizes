import { createFileRoute, Outlet } from "@tanstack/react-router";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/competitions")({
  head: () => {
    const pathname = "/competitions";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Competitions — Win cars, electronics, homes & more · Raffila";
    const description =
      "Browse all live prize competitions on Raffila — cars, homes, electronics, jewelry, business grants, travel and more. Transparent entry prices, fair verified draws. raffila.com";

    // Competition URLs are no longer listed here: they live only in Firestore
    // and cannot be read during head() resolution. The /sitemap/xml route is
    // the single source of competition URLs.
    const collectionJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Raffila Live Competitions",
      description: "Live and upcoming prize competitions on Raffila",
      url: canonical,
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
        {
          "data-head-children": true,
          __html: `<script type="application/ld+json">${collectionJsonLd}</script>`,
        } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: () => <Outlet />,
});
