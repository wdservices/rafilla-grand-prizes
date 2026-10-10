import { createFileRoute, useParams } from "@tanstack/react-router";
import { PublicDrawPage } from "@/components/raffila/draws";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/draw/$slug")({
  head: ({ params }) => {
    const pathname = `/draw/${params.slug}`;
    const canonical = `${canonicalBase}${pathname}`;
    const formattedSlug = params.slug.replaceAll("-", " ");
    const title = `Live Draw: ${formattedSlug} — Raffila`;
    const description = `Watch the official live prize draw for ${formattedSlug} on Raffila. Verifiable ticket pool, Wheel of Fortune reveal, and cryptographic audit. raffila.com`;

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
  component: DirectDrawRouteComponent,
});

function DirectDrawRouteComponent() {
  const { slug } = useParams({ from: "/draw/$slug" });
  return <PublicDrawPage slug={slug} />;
}
