import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots")({
  loader: async () => {
    const baseUrl = "https://rafilla.com";

    const content = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /partner
Disallow: /auth

Sitemap: ${baseUrl}/sitemap.xml`;

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
});
