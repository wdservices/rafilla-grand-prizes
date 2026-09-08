import { createFileRoute } from "@tanstack/react-router";
import { FAQPage } from "@/components/raffila/public-pages";
import { faqs } from "@/lib/raffila-data";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/faq")({
  head: () => {
    const pathname = "/faq";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "FAQ — Questions about entries, wallet, draws, referrals · Raffila";
    const description =
      "Frequently asked questions: How to enter Raffila competitions, wallet rules, referral commissions, draw verification, claiming prizes, refunds and more. raffila.com";

    const faqPageJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
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
        { "data-head-children": true, __html: `<script type="application/ld+json">${faqPageJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: FAQPage,
});
