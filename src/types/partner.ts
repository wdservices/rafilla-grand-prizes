export type PartnerStatus =
  "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED" | "INACTIVE";

export type AssetCondition = "Brand new" | "Like new" | "Refurbished" | "Used";

export type AssetStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ASSIGNED";

export type PayoutStatus =
  "PENDING" | "CALCULATED" | "APPROVED" | "PROCESSING" | "PAID" | "ON_HOLD" | "DISPUTED";

export interface AuthorizedRepresentative {
  fullName: string;
  position: string;
  email: string;
  phone: string;
}

export interface PartnerDocuments {
  cacCertificate?: string;
  additionalDocument?: string;
  proofOfAddress?: string;
  otherDocument?: string;
}

export interface PartnerBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingCode?: string;
}

export interface PartnerProfile {
  id: string;
  userId?: string;
  businessName: string;
  businessType: string;
  cacNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  companyEmail: string;
  companyPhone: string;
  website?: string;
  description: string;
  logo?: string;
  logoTint?: "sky" | "mint" | "coral" | "lemon" | "lilac";
  logoInitials?: string;
  authorizedRepresentative: AuthorizedRepresentative;
  documents: PartnerDocuments;
  bankDetails?: PartnerBankDetails;
  verificationStatus: PartnerStatus;
  adminNotes?: string;
  defaultRevenueSplitPercent?: number; // e.g. 80
  createdAt: string;
  updatedAt: string;
}

export interface PartnerAsset {
  id: string;
  partnerId: string;
  partnerName: string;
  name: string;
  category: string;
  description: string;
  declaredValueKobo: number;
  location: string;
  condition: AssetCondition;
  referenceNumber?: string;
  images: string[];
  documents?: string[];
  status: AssetStatus;
  competitionId?: string;
  competitionTitle?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueSplitConfig {
  competitionId: string;
  partnerId: string;
  partnerName: string;
  partnerPercentage: number;
  rafillaPercentage: number;
  effectiveFrom: string;
  lockedAt?: string;
  isLocked: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueLedgerEntry {
  id: string;
  competitionId: string;
  competitionTitle: string;
  partnerId: string;
  partnerName: string;
  batchId: string;
  ticketCount: number;
  entryPriceKobo: number;
  grossRevenueKobo: number;
  partnerPercentage: number;
  partnerAmountKobo: number;
  rafillaPercentage: number;
  rafillaAmountKobo: number;
  status: "CONFIRMED" | "REFUNDED" | "ADJUSTED";
  timestamp: string;
  reference: string;
}

export interface PartnerPayoutRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  competitionId?: string;
  competitionTitle?: string;
  period: string;
  grossRevenueKobo: number;
  partnerPercentage: number;
  amountKobo: number;
  status: PayoutStatus;
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PartnerCompetition {
  id: string;
  title: string;
  prizeName: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  entryPriceKobo: number;
  ticketsSold: number;
  totalEntries: number;
  grossRevenueKobo: number;
  partnerAmountKobo: number;
  partnerPercentage: number;
  rafillaAmountKobo: number;
  rafillaPercentage: number;
  closingDate: string;
  drawStatus: string;
  competitionSlug?: string;
}

export interface PartnerAuditLog {
  id: string;
  actorId: string;
  actorRole: "admin" | "partner" | "system";
  action: string;
  entityType: "partner" | "asset" | "competition" | "revenue_split" | "payout";
  entityId: string;
  entityName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
