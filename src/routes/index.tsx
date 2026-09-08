import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/raffila/public-pages";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/")({
  head: () => {
    const pathname = "/";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Raffila — Fair draws. Real prizes.";
    const description =
      "Premium prize competitions across Africa — win cars, homes, electronics, cash grants and more. Fair verified draws, secure entries, real prizes delivered. raffila.com";
    const organizationJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Raffila",
      url: canonicalBase,
      logo: "https://raffila.com/logo.png",
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
        email: "support@raffila.com",
        contactType: "customer support",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
      sameAs: [
        "https://facebook.com/raffilang",
        "https://instagram.com/raffilang",
        "https://twitter.com/raffilang",
        "https://x.com/raffilang",
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
        { "data-head-children": true, __html: `<script type="application/ld+json">${organizationJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: HomePage,
});
