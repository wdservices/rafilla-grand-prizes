import mercedesImage from "@/assets/rafilla-mercedes.jpg";
import techBundleImage from "@/assets/rafilla-tech-bundle.jpg";
import apartmentImage from "@/assets/rafilla-apartment.jpg";

export type CompetitionStatus = "LIVE" | "CLOSING SOON" | "UPCOMING";

export type Competition = {
  slug: string;
  title: string;
  category: string;
  description: string;
  prizeValue: string;
  entryPrice: number;
  totalEntries: number;
  entriesSold: number;
  closes: string;
  status: CompetitionStatus;
  featured?: boolean;
  image: string;
  imageAlt: string;
  accent: "coral" | "sky" | "lemon";
  specs: string[];
};

export const competitions: Competition[] = [
  {
    slug: "mercedes-benz-c-class",
    title: "Mercedes-Benz C-Class 2025",
    category: "Auto",
    description:
      "A refined executive sedan with a premium cabin, intelligent assistance, and the presence to make every arrival count.",
    prizeValue: "₦12,000,000",
    entryPrice: 10_000,
    totalEntries: 5_000,
    entriesSold: 4_210,
    closes: "18 Mar · 23:59",
    status: "LIVE",
    featured: true,
    image: mercedesImage,
    imageAlt: "Silver Mercedes-Benz C-Class sedan in a warm lilac studio",
    accent: "coral",
    specs: ["2025 model", "Premium interior", "Automatic transmission", "Executive sedan"],
  },
  {
    slug: "nova-x1-bundle",
    title: "Nova X1 Bundle",
    category: "Tech",
    description: "A complete everyday tech set built around a flagship smartphone and connected essentials.",
    prizeValue: "₦1,950,000",
    entryPrice: 5_000,
    totalEntries: 10_000,
    entriesSold: 6_500,
    closes: "12 Mar · 23:59",
    status: "CLOSING SOON",
    image: techBundleImage,
    imageAlt: "Blue smartphone, earbuds, and mint smartwatch on a pastel desk",
    accent: "sky",
    specs: ["Flagship smartphone", "Wireless earbuds", "Smartwatch", "Premium accessory set"],
  },
  {
    slug: "luxury-2-bed-apartment",
    title: "Luxury 2-Bed Apartment",
    category: "Property",
    description: "A bright contemporary apartment designed for calm city living, entertaining, and everyday comfort.",
    prizeValue: "₦38,000,000",
    entryPrice: 2_500,
    totalEntries: 22_500,
    entriesSold: 9_200,
    closes: "25 Mar · 23:59",
    status: "LIVE",
    image: apartmentImage,
    imageAlt: "Bright contemporary apartment lounge with warm daylight and yellow accents",
    accent: "lemon",
    specs: ["Two bedrooms", "Contemporary lounge", "Daylight-filled interiors", "City-facing balcony"],
  },
];

export const featuredCompetition = competitions.find((competition) => competition.featured) ?? competitions[0];

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export const getProgress = (competition: Competition) =>
  Math.min(100, Math.round((competition.entriesSold / competition.totalEntries) * 100));

export const getCompetition = (slug: string) => competitions.find((competition) => competition.slug === slug);