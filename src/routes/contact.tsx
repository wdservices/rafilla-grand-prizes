import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/raffila/public-pages";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/contact")({
  head: () => {
    const pathname = "/contact";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Contact us — Support, partnerships, press · Raffila";
    const description =
      "Contact Raffila: support tickets, partner onboarding, press enquiries, winner verification help. Email us or chat with Lagos-based team. raffila.com";

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
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: ContactPage,
});
