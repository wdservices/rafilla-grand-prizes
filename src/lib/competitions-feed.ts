import { collection, getDocs, limit, query } from "firebase/firestore";

import { db } from "./firebase";
import { formatCloses, formatDrawDate } from "./format";
import {
  competitions as mockCompetitions,
  LEGACY_CATEGORY_MAP,
  type Competition,
} from "./raffila-data";

const ACCENTS: Competition["accent"][] = ["coral", "sky", "lemon", "mint", "lilac"];

/** Turn "Lexus RX 350" into "lexus-rx-350". Shared with the admin form. */
export function slugifyTitle(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function accentFor(slug: string): Competition["accent"] {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length]!;
}

function toMs(value: unknown): number {
  try {
    const v = value as any;
    if (v && typeof v.toDate === "function") return (v.toDate() as Date).getTime();
  } catch {
    // ignore
  }
  if (typeof value === "string" && value) {
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

/**
 * Map a Firestore competition document to the app's Competition shape.
 * Returns null for drafts (unless includeDrafts) so unpublished work never
 * leaks onto public surfaces.
 */
export function docToCompetition(
  id: string,
  data: Record<string, unknown>,
  index: number,
  includeDrafts = false,
): Competition | null {
  const rawStatus = String(data["status"] ?? "LIVE").toUpperCase();
  if (!includeDrafts && (rawStatus === "DRAFT" || rawStatus === "CANCELLED")) return null;

  const status: Competition["status"] =
    rawStatus === "LIVE"
      ? "LIVE"
      : rawStatus === "COMPLETED"
        ? "COMPLETED"
        : rawStatus === "CLOSING SOON"
          ? "CLOSING SOON"
          : "UPCOMING";

  const slug = String(data["slug"] ?? id);
  const title = String(data["title"] ?? data["assetName"] ?? slug);
  const rawCategory = String(data["category"] ?? "General");
  // Migrate legacy category names to final taxonomy (PDF §2).
  const category = LEGACY_CATEGORY_MAP[rawCategory] ?? rawCategory;
  const entryPrice = Number(data["entryPrice"] ?? 0) || 0;
  const totalEntries = Number(data["totalEntries"] ?? 0) || 0;
  const entriesSold = Number(data["entriesSold"] ?? 0) || 0;
  const marketValueKobo = Number(data["marketValueKobo"] ?? data["prizeValueKobo"] ?? 0) || 0;
  const drawDateRaw = String(data["drawDate"] ?? data["closes"] ?? "");
  const closesRaw = String(data["closes"] ?? drawDateRaw);
  const closesMs = toMs(data["closes"] ?? data["drawDate"]);
  const daysUntilClose = closesMs
    ? Math.max(0, Math.ceil((closesMs - Date.now()) / 86400000))
    : 30;
  const images = Array.isArray(data["images"]) ? (data["images"] as string[]) : [];
  const image = String(data["image"] ?? images[0] ?? "");

  return {
    slug,
    title,
    category,
    partner: String(data["partner"] ?? "Raffila"),
    description: String(data["description"] ?? ""),
    prizeValueKobo: marketValueKobo,
    entryPrice,
    totalEntries,
    entriesSold,
    closes: formatCloses(closesRaw),
    daysUntilClose,
    status,
    featured: Boolean(data["featured"] ?? index === 0),
    image,
    imageAlt: String(data["imageAlt"] ?? data["assetName"] ?? title),
    accent: accentFor(slug),
    specs: Array.isArray(data["specs"]) ? (data["specs"] as string[]) : [],
    drawDate: formatDrawDate(drawDateRaw),
    prizeCondition: String(data["prizeCondition"] ?? data["condition"] ?? "New"),
    warranty: String(data["warranty"] ?? ""),
    make: String(data["make"] ?? ""),
    model: String(data["model"] ?? ""),
    year: (data["year"] as number | string) ?? "",
    serialNo: String(data["serialNo"] ?? ""),
    dimensions: String(data["dimensions"] ?? ""),
    color: String(data["color"] ?? ""),
    inclusions: Array.isArray(data["inclusions"]) ? (data["inclusions"] as string[]) : [],
    exclusions: Array.isArray(data["exclusions"]) ? (data["exclusions"] as string[]) : [],
    maxTicketsPerUser: Number(data["maxPerUser"] ?? data["maxTicketsPerUser"] ?? 50) || 50,
    marketValueKobo,
  };
}

async function fetchDbCompetitions(includeDrafts: boolean): Promise<Competition[]> {
  const snap = await getDocs(query(collection(db, "competitions"), limit(100)));
  const out: Competition[] = [];
  snap.docs.forEach((d, i) => {
    const c = docToCompetition(d.id, d.data() as Record<string, unknown>, i, includeDrafts);
    if (c) out.push(c);
  });
  return out;
}

/**
 * Backend chronology guard (PDF §5 P0): a draw cannot be scheduled before
 * a competition closes. Returns an error message or null when valid.
 */
export function validateCompetitionDates(input: {
  closes?: unknown;
  closesAt?: unknown;
  drawDate?: unknown;
  drawAt?: unknown;
}): string | null {
  const toMs = (v: unknown): number => {
    try {
      const x = v as any;
      if (x && typeof x.toDate === "function") return (x.toDate() as Date).getTime();
    } catch {
      // ignore
    }
    if (typeof v === "string" && v) {
      const t = new Date(v).getTime();
      return Number.isNaN(t) ? 0 : t;
    }
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return 0;
  };
  const closesMs = toMs(input.closesAt ?? input.closes);
  const drawMs = toMs(input.drawAt ?? input.drawDate);
  if (closesMs && drawMs && drawMs <= closesMs) {
    return "Draw date must be after the competition closes.";
  }
  return null;
}

/**
 * Live competitions: Firestore documents first, mock catalogue filling any
 * gaps by slug. Falls back to mock-only when Firestore is unreachable.
 */
export async function getLiveCompetitions(includeDrafts = false): Promise<{
  competitions: Competition[];
  live: boolean;
}> {
  try {
    const dbComps = await fetchDbCompetitions(includeDrafts);
    if (dbComps.length === 0) return { competitions: mockCompetitions, live: false };
    const seen = new Set(dbComps.map((c) => c.slug));
    return {
      competitions: [...dbComps, ...mockCompetitions.filter((c) => !seen.has(c.slug))],
      live: true,
    };
  } catch (err) {
    console.warn("Competitions feed falling back to catalogue:", err);
    return { competitions: mockCompetitions, live: false };
  }
}
