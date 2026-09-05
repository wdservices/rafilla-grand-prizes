import { createFileRoute } from "@tanstack/react-router";
import { CompetitionDetailPage } from "@/components/rafilla/public-pages";
import { formatNaira, getCompetition } from "@/lib/rafilla-data";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/competitions/$slug")({
  head: ({ params }) => {
    const pathname = `/competitions/${params.slug}`;
    const canonical = `${canonicalBase}${pathname}`;
    const competition = getCompetition(params.slug);
    const priceStr = competition ? formatNaira(competition.entryPrice) : "";
    const title = competition
      ? `${competition.title} — Win ${competition.make || ""} ${competition.model || ""} for ${priceStr} · Rafilla`.replace(/\s+/g, " ").trim()
      : `Competition: ${params.slug} — Rafilla Grand Prizes`;
    const description = competition
      ? `${competition.description.slice(0, 135)} Entry ${formatNaira(competition.entryPrice)}. Prize value ${formatNaira(competition.prizeValueKobo)}. Live draw ${competition.drawDate}. rafilla.com`
      : `Prize draw competition ${params.slug} — transparent, verified draws at Rafilla Grand Prizes. rafilla.com`;
    const ogImage = competition
      ? `https://rafilla.com/og/competitions/${competition.slug}.png`
      : ogImageDefault;

    const eventJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: competition?.title ?? params.slug,
      description: competition?.description ?? "Rafilla competition",
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
        name: "Rafilla Grand Prizes Ltd",
        url: canonicalBase,
        email: "support@rafilla.com",
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
            name: "Rafilla Grand Prizes Ltd",
          },
        },
      ],
      performer: {
        "@type": "Organization",
        name: "Rafilla Grand Prizes Ltd",
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
        { property: "og:site_name", content: "Rafilla Grand Prizes" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:site", content: "@rafillang" },
        { name: "twitter:creator", content: "@rafillang" },
        { "data-head-children": true, __html: `<script type="application/ld+json">${eventJsonLd}</script>` } as any,
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hreflang: "en", href: canonical },
      ],
    };
  },
  component: CompetitionDetailPage,
});
