import { createFileRoute } from "@tanstack/react-router";
import { CompetitionDetailPage } from "@/components/raffila/public-pages";
import { formatNaira, getCompetition } from "@/lib/raffila-data";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/competitions/$slug")({
  head: ({ params }) => {
    const pathname = `/competitions/${params.slug}`;
    const canonical = `${canonicalBase}${pathname}`;
    const competition = getCompetition(params.slug);
    const priceStr = competition ? formatNaira(competition.entryPrice) : "";
    const title = competition
      ? `${competition.title} — Win ${competition.make || ""} ${competition.model || ""} for ${priceStr} · Raffila`.replace(/\s+/g, " ").trim()
      : `Competition: ${params.slug} — Raffila`;
    const description = competition
      ? `${competition.description.slice(0, 135)} Entry ${formatNaira(competition.entryPrice)}. Prize value ${formatNaira(competition.prizeValueKobo)}. Live draw ${competition.drawDate}. raffila.com`
      : `Prize draw competition ${params.slug} — transparent, verified draws at Raffila. raffila.com`;
    const ogImage = competition
      ? `https://raffila.com/og/competitions/${competition.slug}.png`
      : ogImageDefault;

    const eventJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: competition?.title ?? params.slug,
      description: competition?.description ?? "Raffila competition",
      url: canonical,
      image: [ogImage],
      startDate: competition ? new Date(Date.now() + (365 - competition.daysUntilClose) * 86400000).toISOString() : new Date().toISOString(),
      endDate: competition ? new Date(Date.now() + (365 - competition.daysUntilClose + 1) * 86400000).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: canonical,
        name: "Online / Lagos, Nigeria",
        address: {
          "@type": "PostalAddress",
          addressCountry: "NG",
          addressLocality: "Lagos",
        },
      },
      organizer: {
        "@type": "Organization",
        name: "Raffila Ltd",
        url: canonicalBase,
        email: "support@raffila.com",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Entry ticket",
          price: competition ? Math.round(competition.entryPrice / 100) : 0,
          priceCurrency: "NGN",
          availability: "https://schema.org/InStock",
          url: canonical,
          validFrom: new Date().toISOString(),
          seller: {
            "@type": "Organization",
            name: "Raffila Ltd",
          },
        },
      ],
      performer: {
        "@type": "Organization",
        name: "Raffila Ltd",
      },
      typicalAgeRange: "18+",
    });

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "Raffila" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:site", content: "@raffilang" },
        { name: "twitter:creator", content: "@raffilang" },
        { "data-head-children": true, __html: `<script type="application/ld+json">${eventJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: CompetitionDetailPage,
});
