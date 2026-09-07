import { createFileRoute } from "@tanstack/react-router";
import { AdminAuditLogsPage } from "@/components/rafilla/admin";

const canonicalBase = "https://rafilla.com";
const ogImageDefault = "https://rafilla.com/og-default.png";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => {
    const pathname = "/admin/audit-logs";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Audit logs — Admin · Rafilla";
    const description =
      "Private admin audit logs: immutable platform event log, filter by actor/action/entity, JSON diff viewer, tamper-evident record export. Noindex staff-only. rafilla.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
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
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: AdminAuditLogsPage,
});
