import { createFileRoute } from "@tanstack/react-router";
import { PartnerOnboardingForm } from "@/components/raffila/partner/partner-onboarding-form";

const canonicalBase = "https://raffila.com";
const ogImageDefault = "https://raffila.com/og-default.png";

export const Route = createFileRoute("/partner-signup")({
  head: () => {
    const pathname = "/partner-signup";
    const canonical = `${canonicalBase}${pathname}`;
    const title = "Register as an Asset Partner · Raffila Compliance & Onboarding";
    const description =
      "Join Raffila's verified partner network. Submit your business credentials, verify CAC corporate status, and list luxury automotive, real estate, and electronics prizes.";

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
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: PartnerOnboardingForm,
});
