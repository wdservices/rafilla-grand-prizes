/**
 * Rafilla Revenue Split & Financial Calculation Engine
 *
 * Rules:
 * 1. Revenue sharing is configured PER COMPETITION.
 * 2. Formula:
 *    Gross Revenue = Valid Tickets Sold × Entry Price
 *    Partner Share = Gross Revenue × Partner % / 100
 *    Rafilla Share = Gross Revenue × Rafilla % / 100
 * 3. Never count invalid, failed, pending, or refunded transactions.
 * 4. Calculations are in integer minor units (kobo) to prevent floating-point discrepancies.
 * 5. Partner % + Rafilla % MUST equal 100%.
 */

export interface RevenueCalculationResult {
  validTicketsSold: number;
  entryPriceKobo: number;
  grossRevenueKobo: number;
  partnerPercentage: number;
  partnerAmountKobo: number;
  rafillaPercentage: number;
  rafillaAmountKobo: number;
}

export interface ProjectedRevenueResult {
  maxEntries: number;
  entryPriceKobo: number;
  projectedGrossKobo: number;
  partnerPercentage: number;
  projectedPartnerKobo: number;
  rafillaPercentage: number;
  projectedRafillaKobo: number;
}

/**
 * Calculates actual gross revenue strictly from valid ticket count and price
 */
export function calculateGrossRevenue(validTicketsSold: number, entryPriceKobo: number): number {
  if (validTicketsSold < 0 || entryPriceKobo < 0) return 0;
  return Math.round(validTicketsSold * entryPriceKobo);
}

/**
 * Calculates the partner's share in kobo from confirmed gross revenue
 */
export function calculatePartnerShare(grossRevenueKobo: number, partnerPercentage: number): number {
  if (grossRevenueKobo <= 0 || partnerPercentage <= 0) return 0;
  const clampedPct = Math.min(100, Math.max(0, partnerPercentage));
  return Math.round((grossRevenueKobo * clampedPct) / 100);
}

/**
 * Calculates Rafilla's platform share in kobo from confirmed gross revenue
 */
export function calculateRafillaShare(grossRevenueKobo: number, rafillaPercentage: number): number {
  if (grossRevenueKobo <= 0 || rafillaPercentage <= 0) return 0;
  const clampedPct = Math.min(100, Math.max(0, rafillaPercentage));
  return Math.round((grossRevenueKobo * clampedPct) / 100);
}

/**
 * Full calculation for a competition based on valid tickets and configured split
 */
export function calculateCompetitionRevenue(
  validTicketsSold: number,
  entryPriceKobo: number,
  partnerPercentage: number,
  rafillaPercentage?: number,
): RevenueCalculationResult {
  const safeTickets = Math.max(0, Math.floor(validTicketsSold));
  const safePrice = Math.max(0, Math.round(entryPriceKobo));
  const pPct = Math.min(100, Math.max(0, Number(partnerPercentage) || 0));
  const rPct =
    typeof rafillaPercentage === "number"
      ? Math.min(100, Math.max(0, rafillaPercentage))
      : 100 - pPct;

  const grossRevenueKobo = calculateGrossRevenue(safeTickets, safePrice);
  const partnerAmountKobo = calculatePartnerShare(grossRevenueKobo, pPct);
  // Guarantee exact reconciliation: Rafilla share is remainder to prevent minor rounding drift
  const rafillaAmountKobo = Math.max(0, grossRevenueKobo - partnerAmountKobo);

  return {
    validTicketsSold: safeTickets,
    entryPriceKobo: safePrice,
    grossRevenueKobo,
    partnerPercentage: pPct,
    partnerAmountKobo,
    rafillaPercentage: rPct,
    rafillaAmountKobo,
  };
}

/**
 * Calculates projected potential revenue based on maximum entries (clearly labeled projection)
 */
export function calculateProjectedRevenue(
  maxEntries: number,
  entryPriceKobo: number,
  partnerPercentage: number,
  rafillaPercentage?: number,
): ProjectedRevenueResult {
  const safeMax = Math.max(0, Math.floor(maxEntries));
  const safePrice = Math.max(0, Math.round(entryPriceKobo));
  const pPct = Math.min(100, Math.max(0, Number(partnerPercentage) || 0));
  const rPct =
    typeof rafillaPercentage === "number"
      ? Math.min(100, Math.max(0, rafillaPercentage))
      : 100 - pPct;

  const projectedGrossKobo = Math.round(safeMax * safePrice);
  const projectedPartnerKobo = Math.round((projectedGrossKobo * pPct) / 100);
  const projectedRafillaKobo = Math.max(0, projectedGrossKobo - projectedPartnerKobo);

  return {
    maxEntries: safeMax,
    entryPriceKobo: safePrice,
    projectedGrossKobo,
    partnerPercentage: pPct,
    projectedPartnerKobo,
    rafillaPercentage: rPct,
    projectedRafillaKobo,
  };
}

/**
 * Validates that partner + rafilla percentages equal exactly 100%
 */
export function validateRevenueSplit(
  partnerPercentage: number,
  rafillaPercentage: number,
): { valid: boolean; error?: string } {
  if (partnerPercentage < 0 || partnerPercentage > 100) {
    return { valid: false, error: "Partner percentage must be between 0% and 100%." };
  }
  if (rafillaPercentage < 0 || rafillaPercentage > 100) {
    return { valid: false, error: "Rafilla percentage must be between 0% and 100%." };
  }
  const sum = Math.round((partnerPercentage + rafillaPercentage) * 10) / 10;
  if (sum !== 100) {
    return {
      valid: false,
      error: `Partner share (${partnerPercentage}%) + Rafilla share (${rafillaPercentage}%) must equal exactly 100% (currently ${sum}%).`,
    };
  }
  return { valid: true };
}
