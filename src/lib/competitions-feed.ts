import { collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";

import { db } from "./firebase";
import { formatCloses, formatDrawDate, lagosDateWithYear } from "./format";
import {
  LEGACY_CATEGORY_MAP,
  normalizeCategory,
  type Competition,
  formatNaira,
  winnerCards as fallbackWinnerCards,
  type WinnerCard,
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
  // Migrate legacy / free-text category names to final taxonomy (PDF §2).
  // Firestore docs created via admin free-text (e.g. "auto") are normalized
  // case-insensitively so carousels/filters never show raw variants.
  const category = normalizeCategory(rawCategory);
  const entryPrice = Number(data["entryPrice"] ?? 0) || 0;
  const totalEntries = Number(data["totalEntries"] ?? 0) || 0;
  const entriesSold = Number(data["entriesSold"] ?? 0) || 0;
  const marketValueKobo = Number(data["marketValueKobo"] ?? data["prizeValueKobo"] ?? 0) || 0;
  const drawDateRaw = String(data["drawDate"] ?? data["closes"] ?? "");
  const closesRaw = String(data["closes"] ?? drawDateRaw);
  const closesMs = toMs(data["closes"] ?? data["drawDate"]);
  const daysUntilClose = closesMs ? Math.max(0, Math.ceil((closesMs - Date.now()) / 86400000)) : 30;
  const images = Array.isArray(data["images"]) ? (data["images"] as string[]) : [];
  const image = String(data["image"] ?? images[0] ?? "");

  const winnerDisplayNameRaw =
    data["winnerDisplayName"] ?? data["winnerName"] ?? null;
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
    winningTicketId: data["winningTicketId"] as string | null | undefined ?? null,
    winningTicketNumber:
      data["winningTicketNumber"] ?? data["winnerTicketNumber"] as string | null | undefined ?? null,
    winnerUserId: data["winnerUserId"] as string | null | undefined ?? null,
    winnerDisplayName: winnerDisplayNameRaw as string | null,
    winnerHandle: data["winnerHandle"] as string | null | undefined ?? null,
    winnerTicketNumber:
      data["winnerTicketNumber"] ?? data["winningTicketNumber"] as string | null | undefined ?? null,
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
 * Live competitions: Firestore is the ONLY source of truth. There is no
 * hardcoded catalogue to fall back to, so a read failure resolves to an empty
 * list rather than inventing competitions the operator deleted. `live` reports
 * whether the read actually succeeded, which lets UI show a connection error
 * instead of silently rendering stale or fictional data.
 */
export async function getLiveCompetitions(includeDrafts = false): Promise<{
  competitions: Competition[];
  live: boolean;
}> {
  try {
    return { competitions: await fetchDbCompetitions(includeDrafts), live: true };
  } catch (err) {
    console.error("Competitions feed failed to read Firestore:", err);
    return { competitions: [], live: false };
  }
}

function winnerDrawDateString(value: unknown): string {
  try {
    const v = value as any;
    if (v && typeof v.toDate === "function") {
      return lagosDateWithYear((v.toDate() as Date).toISOString());
    }
  } catch {
    // ignore
  }
  if (value instanceof Date) return lagosDateWithYear(value.toISOString());
  if (typeof value === "string" && value) return lagosDateWithYear(value);
  if (typeof value === "number" && value > 0) return lagosDateWithYear(value);
  return lagosDateWithYear(new Date().toISOString());
}

function winnerMarketValueKobo(comp: Competition | undefined): number {
  if (!comp) return 0;
  return comp.marketValueKobo || comp.prizeValueKobo || 0;
}

function winnerImage(comp: Competition | undefined): { image: string; imageAlt: string } {
  if (comp && comp.image) return { image: comp.image, imageAlt: comp.imageAlt || comp.title };
  const firstFallback = fallbackWinnerCards[0];
  return {
    image: firstFallback?.image ?? "",
    imageAlt: firstFallback?.imageAlt ?? "Competition prize",
  };
}

/**
 * Build a combined winners feed:
 *  1. Read the `winners` Firestore collection (most recent first).
 *  2. Join with competitions for prize image, title, value, and category context.
 *  3. Include COMPLETED competitions that carry winner fields directly (in case
 *     the winners showcase best-effort write was skipped).
 *  4. If no winners are live yet AND the read itself succeeded, surface the
 *     static seed cards so the UI is never empty on a fresh environment —
 *     but if the read failed, return empty so the caller can show an error.
 */
export async function getLiveWinners(): Promise<{
  winners: WinnerCard[];
  live: boolean;
}> {
  try {
    const comps = await fetchDbCompetitions(false);
    const compBySlug = new Map<string, Competition>();
    comps.forEach((c) => compBySlug.set(c.slug, c));

    let showcaseWinners: WinnerCard[] = [];
    try {
      const winnersSnap = await getDocs(
        query(collection(db, "winners"), orderBy("createdAt", "desc"), limit(50)),
      );
      showcaseWinners = winnersSnap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        const competitionSlug =
          String(raw["competitionSlug"] ?? raw["competitionId"] ?? "");
        const comp = comps.find((c) => c.slug === competitionSlug);
        const img = winnerImage(comp);
        const valueKobo = winnerMarketValueKobo(comp);
        const competitionTitle = String(
          raw["competitionTitle"] ?? comp?.title ?? competitionSlug,
        );
        const winnerNameRaw = String(raw["winnerName"] ?? raw["winnerDisplayName"] ?? "");
        return {
          id: String(raw["id"] ?? d.id),
          winnerName: winnerNameRaw || "Verified Winner",
          prize: competitionTitle,
          competition: comp?.category || competitionTitle,
          drawDate: winnerDrawDateString(raw["drawDate"] ?? raw["createdAt"]),
          location: comp?.partner ? `${comp.partner} draw` : "Lagos, Nigeria",
          amount: valueKobo > 0 ? formatNaira(valueKobo) : comp?.title ? competitionTitle : "",
          verified: Boolean(raw["verified"] ?? true),
          image: img.image,
          imageAlt: img.imageAlt,
        };
      });
    } catch (wsErr) {
      console.warn("Winners showcase read failed, falling back to competition fields:", wsErr);
    }

    const wonCompetitions = comps
      .filter((c) => c.winnerDisplayName && (c.status === "COMPLETED" || c.winnerTicketNumber))
      .map((c) => {
        const img = winnerImage(c);
        const valueKobo = winnerMarketValueKobo(c);
        return {
          id: `comp-${c.slug}`,
          winnerName: c.winnerDisplayName as string,
          prize: c.title,
          competition: c.category,
          drawDate: c.drawDate || winnerDrawDateString(new Date().toISOString()),
          location: c.partner ? `${c.partner} draw` : "Lagos, Nigeria",
          amount: valueKobo > 0 ? formatNaira(valueKobo) : c.title,
          verified: true,
          image: img.image,
          imageAlt: img.imageAlt,
        } as WinnerCard;
      });

    const seenIds = new Set<string>();
    const merged: WinnerCard[] = [];
    for (const w of [...showcaseWinners, ...wonCompetitions]) {
      if (!w || !w.id) continue;
      if (seenIds.has(w.id)) continue;
      seenIds.add(w.id);
      merged.push(w);
    }

    if (merged.length === 0) {
      return { winners: [...fallbackWinnerCards], live: true };
    }

    return { winners: merged, live: true };
  } catch (err) {
    console.error("Winners feed failed to read Firestore:", err);
    return { winners: [], live: false };
  }
}
