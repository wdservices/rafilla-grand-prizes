import { createFileRoute } from "@tanstack/react-router";
import { competitions } from "@/lib/rafilla-data";

export const Route = createFileRoute("/sitemap/xml")({
  loader: async () => {
    const baseUrl = "https://rafilla.com";
    const today = new Date().toISOString().split("T")[0];

    const staticRoutes = [
      "",
      "/competitions",
      "/about",
      "/how-it-works",
      "/winners",
      "/become-a-partner",
      "/faq",
      "/contact",
      "/terms-and-conditions",
      "/privacy-policy",
      "/competition-rules",
    ];

    const staticUrls = staticRoutes
      .map(
        (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`,
      )
      .join("\n");

    const competitionUrls = competitions
      .map(
        (comp) => `  <url>
    <loc>${baseUrl}/competitions/${comp.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${competitionUrls}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
});
