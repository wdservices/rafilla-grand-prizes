import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/rafilla/public-pages";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/")({
  head: () => {
    const pathname = "/";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Rafilla Grand Prizes — Fair draws. Real prizes.";
    const description =
      "Premium prize competitions in Nigeria — win cars, homes, electronics, cash grants and more. Fair verified draws, secure entries, real prizes delivered. rafilla.com";
    const organizationJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Rafilla Grand Prizes",
      url: canonicalBase,
      logo: "https://rafilla.com/logo.png",
      image: ogImageDefault,
      description:
        "Premium prize competitions with publicly verifiable draws.",
      foundingDate: "2025",
      address: {
        "@type": "PostalAddress",
        addressCountry: "NG",
        addressLocality: "Lagos",
        addressRegion: "Lagos State",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@rafilla.com",
        contactType: "customer support",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
      sameAs: [
        "https://facebook.com/rafillang",
        "https://instagram.com/rafillang",
        "https://twitter.com/rafillang",
        "https://x.com/rafillang",
      ],
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
        { "data-head-children": true, __html: `<script type="application/ld+json">${organizationJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hreflang: "en", href: canonical },
      ],
    };
  },
  component: HomePage,
});
