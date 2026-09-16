import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  PartnerProfile,
  PartnerAsset,
  RevenueSplitConfig,
  RevenueLedgerEntry,
  PartnerPayoutRecord,
  PartnerAuditLog,
  PartnerStatus,
  AssetStatus,
} from "@/types/partner";
import { calculateCompetitionRevenue } from "./revenue-split";

// Storage keys for offline resilience & fast demo caching
const PARTNERS_STORAGE_KEY = "raffila:partner_system:partners_v1";
const ASSETS_STORAGE_KEY = "raffila:partner_system:assets_v1";
const REVENUE_SPLITS_STORAGE_KEY = "raffila:partner_system:splits_v1";
const LEDGER_STORAGE_KEY = "raffila:partner_system:ledger_v1";
const PAYOUTS_STORAGE_KEY = "raffila:partner_system:payouts_v1";
const AUDIT_STORAGE_KEY = "raffila:partner_system:audit_v1";

// Default Initial Seed Data matching prompt specifications:
// 1. ABC Motors Ltd (Automotive, APPROVED, Michael Ade)
// 2. Prime Living Properties Ltd (Real Estate, APPROVED, Chidi Okafor)
// 3. TechSphere Electronics Ltd (Electronics, PENDING, Zainab Mohammed)
export const INITIAL_PARTNERS: PartnerProfile[] = [
  {
    id: "partner_abc_motors",
    userId: "ptr_abc_motors_001",
    businessName: "ABC Motors Ltd",
    businessType: "Automotive",
    cacNumber: "RC-1849204",
    address: "Plot 14, Commercial Avenue, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    companyEmail: "partner.demo@abcmotors.example",
    companyPhone: "+234 803 111 2233",
    website: "https://abcmotors.example",
    description:
      "Premier authorized dealership and luxury vehicle importer with showrooms in Lagos and Abuja. Bringing verified high-spec automotive prizes to Rafilla.",
    logo: "/partners/abc-motors.png",
    logoTint: "coral",
    logoInitials: "AM",
    authorizedRepresentative: {
      fullName: "Michael Ade",
      position: "Managing Director",
      email: "partner.demo@abcmotors.example",
      phone: "+234 803 111 2233",
    },
    documents: {
      cacCertificate: "https://secure-docs.raffila.internal/cac/abc-motors-cert.pdf",
      proofOfAddress: "https://secure-docs.raffila.internal/utility/abc-motors-bill.pdf",
    },
    bankDetails: {
      bankName: "Guaranty Trust Bank (GTBank)",
      accountName: "ABC Motors Limited",
      accountNumber: "0148920194",
    },
    verificationStatus: "APPROVED",
    defaultRevenueSplitPercent: 80,
    adminNotes: "Fully verified via CAC portal & physical showroom visit on Jan 14, 2026.",
    createdAt: "2026-01-14T09:00:00Z",
    updatedAt: "2026-01-15T11:00:00Z",
  },
  {
    id: "partner_prime_living",
    userId: "ptr_prime_living_002",
    businessName: "Prime Living Properties Ltd",
    businessType: "Real Estate",
    cacNumber: "RC-2940192",
    address: "8th Floor, Eko Tower 2, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    companyEmail: "properties.demo@primeliving.example",
    companyPhone: "+234 802 444 5566",
    website: "https://primeliving.example",
    description:
      "Developer and manager of luxury serviced apartments, coastal villas, and high-yield residential properties across Lekki and Victoria Island.",
    logo: "/partners/prime-living.png",
    logoTint: "mint",
    logoInitials: "PL",
    authorizedRepresentative: {
      fullName: "Chidi Okafor",
      position: "Director of Partnerships",
      email: "properties.demo@primeliving.example",
      phone: "+234 802 444 5566",
    },
    documents: {
      cacCertificate: "https://secure-docs.raffila.internal/cac/prime-living-cert.pdf",
      proofOfAddress: "https://secure-docs.raffila.internal/utility/prime-living-address.pdf",
    },
    bankDetails: {
      bankName: "Zenith Bank PLC",
      accountName: "Prime Living Properties Ltd",
      accountNumber: "1019284729",
    },
    verificationStatus: "APPROVED",
    defaultRevenueSplitPercent: 85,
    adminNotes: "Title deeds & property management certifications verified by legal counsel.",
    createdAt: "2026-02-02T14:30:00Z",
    updatedAt: "2026-02-04T16:00:00Z",
  },
  {
    id: "partner_techsphere",
    userId: "ptr_techsphere_003",
    businessName: "TechSphere Electronics Ltd",
    businessType: "Electronics",
    cacNumber: "RC-3819401",
    address: "24 Otigba Street, Computer Village, Ikeja",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    companyEmail: "partner@techsphere.example",
    companyPhone: "+234 805 777 8899",
    website: "https://techsphere.example",
    description:
      "Authorized consumer technology and Apple workstation distributor providing factory-sealed computing rigs, mobile flagships, and studio gear.",
    logo: "/partners/techsphere.png",
    logoTint: "sky",
    logoInitials: "TS",
    authorizedRepresentative: {
      fullName: "Zainab Mohammed",
      position: "Head of Commercial Distribution",
      email: "partner@techsphere.example",
      phone: "+234 805 777 8899",
    },
    documents: {
      cacCertificate: "https://secure-docs.raffila.internal/cac/techsphere-cert.pdf",
      additionalDocument: "https://secure-docs.raffila.internal/auth/techsphere-oem.pdf",
    },
    bankDetails: {
      bankName: "Access Bank PLC",
      accountName: "TechSphere Electronics Limited",
      accountNumber: "0729183921",
    },
    verificationStatus: "PENDING",
    defaultRevenueSplitPercent: 75,
    adminNotes: "Application submitted via partner onboarding. Awaiting CAC document verification.",
    createdAt: "2026-03-01T10:15:00Z",
    updatedAt: "2026-03-01T10:15:00Z",
  },
];

export const INITIAL_ASSETS: PartnerAsset[] = [
  {
    id: "asset_toyota_landcruiser_2026",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    name: "2026 Toyota Land Cruiser 300 VXR",
    category: "Automotive",
    description:
      "Brand new 2026 Toyota Land Cruiser 300 Series VXR V6 Twin-Turbo. Pearl White with Saddle Tan leather interior, rear entertainment system, 360-degree cameras, and zero kilometers.",
    declaredValueKobo: 1500000000, // ₦15,000,000
    location: "Victoria Island Showroom, Lagos",
    condition: "Brand new",
    referenceNumber: "VIN-JTMEU39J2026-90412",
    images: ["/mercedes-benz-c-class.png"],
    status: "ASSIGNED",
    competitionId: "toyota-land-cruiser-2026",
    competitionTitle: "Win a 2026 Toyota Land Cruiser",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-22T12:00:00Z",
  },
  {
    id: "asset_mercedes_c_class_2025",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    name: "Mercedes-Benz C-Class 2025 AMG Line",
    category: "Automotive",
    description:
      "Brand new Mercedes-Benz C300 AMG Line with panoramic sliding glass roof, Burmester 3D Surround sound system, digital light package, and Obsidian Black metallic finish.",
    declaredValueKobo: 1200000000, // ₦12,000,000
    location: "Victoria Island Showroom, Lagos",
    condition: "Brand new",
    referenceNumber: "VIN-W1KAF8KB52025-41920",
    images: ["/mercedes-benz-c-class.png"],
    status: "ASSIGNED",
    competitionId: "mercedes-benz-c-class-2025",
    competitionTitle: "Mercedes-Benz C-Class 2025",
    createdAt: "2026-01-25T14:00:00Z",
    updatedAt: "2026-01-26T15:00:00Z",
  },
  {
    id: "asset_luxury_apartment_lekki",
    partnerId: "partner_prime_living",
    partnerName: "Prime Living Properties Ltd",
    name: "Luxury 2-Bed Serviced Apartment in Lekki Phase 1",
    category: "Real Estate",
    description:
      "Fully fitted, high-ceiling luxury 2-bedroom apartment with 24/7 solar hybrid power, swimming pool access, smart biometric entry, and prime waterfront road access in Lekki.",
    declaredValueKobo: 2500000000, // ₦25,000,000
    location: "Admiralty Way, Lekki Phase 1, Lagos",
    condition: "Brand new",
    referenceNumber: "DEED-PLP-2026-LK082",
    images: ["/luxury-apartment.png"],
    status: "ASSIGNED",
    competitionId: "luxury-2-bed-apartment",
    competitionTitle: "Luxury 2-Bed Apartment in Lekki",
    createdAt: "2026-02-05T11:00:00Z",
    updatedAt: "2026-02-08T09:30:00Z",
  },
  {
    id: "asset_macbook_nova_suite",
    partnerId: "partner_techsphere",
    partnerName: "TechSphere Electronics Ltd",
    name: "MacBook Pro M3 Max Studio & Nova X1 Suite",
    category: "Electronics",
    description:
      "Complete creator workstation bundle: 16-inch MacBook Pro M3 Max (48GB RAM, 1TB SSD), Studio Display, Pro Audio Interface, and Nova X1 creator suite in Space Black.",
    declaredValueKobo: 350000000, // ₦3,500,000
    location: "Ikeja Tech Hub, Lagos",
    condition: "Brand new",
    referenceNumber: "SERIAL-APP-M3M-92819",
    images: ["/tech-bundle.png"],
    status: "PENDING_REVIEW",
    createdAt: "2026-03-02T16:00:00Z",
    updatedAt: "2026-03-02T16:00:00Z",
  },
];

export const INITIAL_REVENUE_SPLITS: RevenueSplitConfig[] = [
  {
    competitionId: "toyota-land-cruiser-2026",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    partnerPercentage: 80,
    rafillaPercentage: 20,
    effectiveFrom: "2026-02-01T00:00:00Z",
    lockedAt: "2026-02-01T00:00:00Z",
    isLocked: true,
    createdBy: "admin@raffila.com",
    createdAt: "2026-01-28T12:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
  {
    competitionId: "mercedes-benz-c-class-2025",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    partnerPercentage: 75,
    rafillaPercentage: 25,
    effectiveFrom: "2026-02-15T00:00:00Z",
    isLocked: false,
    createdBy: "admin@raffila.com",
    createdAt: "2026-02-10T14:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  {
    competitionId: "luxury-2-bed-apartment",
    partnerId: "partner_prime_living",
    partnerName: "Prime Living Properties Ltd",
    partnerPercentage: 85,
    rafillaPercentage: 15,
    effectiveFrom: "2026-02-10T00:00:00Z",
    lockedAt: "2026-02-10T00:00:00Z",
    isLocked: true,
    createdBy: "admin@raffila.com",
    createdAt: "2026-02-08T16:00:00Z",
    updatedAt: "2026-02-10T00:00:00Z",
  },
  {
    competitionId: "previous-toyota-fortuner-2025",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    partnerPercentage: 80,
    rafillaPercentage: 20,
    effectiveFrom: "2025-11-01T00:00:00Z",
    lockedAt: "2025-11-01T00:00:00Z",
    isLocked: true,
    createdBy: "admin@raffila.com",
    createdAt: "2025-10-25T10:00:00Z",
    updatedAt: "2025-11-01T00:00:00Z",
  },
];

// Seeded verified revenue ledger batches representing real ticket sales
export const INITIAL_LEDGER: RevenueLedgerEntry[] = [
  {
    id: "LEDGER-BATCH-1001",
    competitionId: "toyota-land-cruiser-2026",
    competitionTitle: "Win a 2026 Toyota Land Cruiser",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    batchId: "BATCH-W08-01",
    ticketCount: 1450,
    entryPriceKobo: 500000, // ₦5,000
    grossRevenueKobo: 725000000, // ₦7,250,000
    partnerPercentage: 80,
    partnerAmountKobo: 580000000, // ₦5,800,000 (80%)
    rafillaPercentage: 20,
    rafillaAmountKobo: 145000000, // ₦1,450,000 (20%)
    status: "CONFIRMED",
    timestamp: "2026-03-01T18:00:00Z",
    reference: "PAY-GATEWAY-BATCH-1001",
  },
  {
    id: "LEDGER-BATCH-1002",
    competitionId: "luxury-2-bed-apartment",
    competitionTitle: "Luxury 2-Bed Apartment in Lekki",
    partnerId: "partner_prime_living",
    partnerName: "Prime Living Properties Ltd",
    batchId: "BATCH-W08-02",
    ticketCount: 620,
    entryPriceKobo: 1000000, // ₦10,000
    grossRevenueKobo: 620000000, // ₦6,200,000
    partnerPercentage: 85,
    partnerAmountKobo: 527000000, // ₦5,270,000 (85%)
    rafillaPercentage: 15,
    rafillaAmountKobo: 93000000, // ₦930,000 (15%)
    status: "CONFIRMED",
    timestamp: "2026-03-02T19:30:00Z",
    reference: "PAY-GATEWAY-BATCH-1002",
  },
  {
    id: "LEDGER-BATCH-0988",
    competitionId: "previous-toyota-fortuner-2025",
    competitionTitle: "2025 Toyota Fortuner Giveaway",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    batchId: "BATCH-W48-03",
    ticketCount: 4000,
    entryPriceKobo: 500000, // ₦5,000
    grossRevenueKobo: 2000000000, // ₦20,000,000
    partnerPercentage: 80,
    partnerAmountKobo: 1600000000, // ₦16,000,000 (80%)
    rafillaPercentage: 20,
    rafillaAmountKobo: 400000000, // ₦4,000,000 (20%)
    status: "CONFIRMED",
    timestamp: "2025-12-15T20:00:00Z",
    reference: "PAY-GATEWAY-BATCH-0988",
  },
];

export const INITIAL_PAYOUTS: PartnerPayoutRecord[] = [
  {
    id: "PAYOUT-001",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    competitionId: "previous-toyota-fortuner-2025",
    competitionTitle: "2025 Toyota Fortuner Giveaway",
    period: "Dec 2025 Draw Settlement",
    grossRevenueKobo: 2000000000,
    partnerPercentage: 80,
    amountKobo: 1600000000, // ₦16,000,000
    status: "PAID",
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0148920194",
    accountName: "ABC Motors Limited",
    reference: "NIP-DISBURSE-20251218-0914",
    approvedBy: "admin@raffila.com",
    approvedAt: "2025-12-17T10:00:00Z",
    paidAt: "2025-12-18T14:30:00Z",
    createdAt: "2025-12-16T09:00:00Z",
  },
  {
    id: "PAYOUT-002",
    partnerId: "partner_abc_motors",
    partnerName: "ABC Motors Ltd",
    competitionId: "toyota-land-cruiser-2026",
    competitionTitle: "Win a 2026 Toyota Land Cruiser",
    period: "March 2026 Interim Settlement",
    grossRevenueKobo: 725000000,
    partnerPercentage: 80,
    amountKobo: 580000000, // ₦5,800,000
    status: "PROCESSING",
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0148920194",
    accountName: "ABC Motors Limited",
    reference: "NIP-PENDING-20260303-1029",
    approvedBy: "admin@raffila.com",
    approvedAt: "2026-03-03T09:15:00Z",
    createdAt: "2026-03-02T12:00:00Z",
  },
  {
    id: "PAYOUT-003",
    partnerId: "partner_prime_living",
    partnerName: "Prime Living Properties Ltd",
    competitionId: "luxury-2-bed-apartment",
    competitionTitle: "Luxury 2-Bed Apartment in Lekki",
    period: "Q1 2026 Interim Allocation",
    grossRevenueKobo: 620000000,
    partnerPercentage: 85,
    amountKobo: 527000000, // ₦5,270,000
    status: "CALCULATED",
    bankName: "Zenith Bank PLC",
    accountNumber: "1019284729",
    accountName: "Prime Living Properties Ltd",
    reference: "CALC-PLP-2026-0304",
    createdAt: "2026-03-03T18:00:00Z",
  },
];

class PartnerStore {
  private partners: PartnerProfile[] = [];
  private assets: PartnerAsset[] = [];
  private revenueSplits: RevenueSplitConfig[] = [];
  private ledger: RevenueLedgerEntry[] = [];
  private payouts: PartnerPayoutRecord[] = [];
  private auditLogs: PartnerAuditLog[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    this.loadInitial();
  }

  private loadInitial() {
    if (typeof window === "undefined") return;

    try {
      const pRaw = localStorage.getItem(PARTNERS_STORAGE_KEY);
      this.partners = pRaw ? JSON.parse(pRaw) : [...INITIAL_PARTNERS];

      const aRaw = localStorage.getItem(ASSETS_STORAGE_KEY);
      this.assets = aRaw ? JSON.parse(aRaw) : [...INITIAL_ASSETS];

      const sRaw = localStorage.getItem(REVENUE_SPLITS_STORAGE_KEY);
      this.revenueSplits = sRaw ? JSON.parse(sRaw) : [...INITIAL_REVENUE_SPLITS];

      const lRaw = localStorage.getItem(LEDGER_STORAGE_KEY);
      this.ledger = lRaw ? JSON.parse(lRaw) : [...INITIAL_LEDGER];

      const payRaw = localStorage.getItem(PAYOUTS_STORAGE_KEY);
      this.payouts = payRaw ? JSON.parse(payRaw) : [...INITIAL_PAYOUTS];

      const audRaw = localStorage.getItem(AUDIT_STORAGE_KEY);
      this.auditLogs = audRaw ? JSON.parse(audRaw) : [];

      this.initialized = true;
    } catch {
      this.partners = [...INITIAL_PARTNERS];
      this.assets = [...INITIAL_ASSETS];
      this.revenueSplits = [...INITIAL_REVENUE_SPLITS];
      this.ledger = [...INITIAL_LEDGER];
      this.payouts = [...INITIAL_PAYOUTS];
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(this.partners));
      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(this.assets));
      localStorage.setItem(REVENUE_SPLITS_STORAGE_KEY, JSON.stringify(this.revenueSplits));
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(this.ledger));
      localStorage.setItem(PAYOUTS_STORAGE_KEY, JSON.stringify(this.payouts));
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn("Could not persist partner state to localStorage", e);
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // --- Partners CRUD & Verification ---
  public getPartners(): PartnerProfile[] {
    return [...this.partners];
  }

  public getPartnerById(id: string): PartnerProfile | undefined {
    return this.partners.find((p) => p.id === id);
  }

  public getApprovedPartners(): PartnerProfile[] {
    return this.partners.filter((p) => p.verificationStatus === "APPROVED");
  }

  public async registerPartnerApplication(input: {
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
    authorizedRepresentative: {
      fullName: string;
      position: string;
      email: string;
      phone: string;
    };
    documents: {
      cacCertificate?: string;
      additionalDocument?: string;
      proofOfAddress?: string;
      otherDocument?: string;
    };
    initialAsset?: {
      name: string;
      category: string;
      description: string;
      declaredValueKobo: number;
      location: string;
      condition: any;
      referenceNumber?: string;
      images: string[];
    };
  }): Promise<{ partner: PartnerProfile; asset?: PartnerAsset }> {
    const partnerId = `partner_${input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newPartner: PartnerProfile = {
      id: partnerId,
      userId: `ptr_${partnerId}`,
      businessName: input.businessName.trim(),
      businessType: input.businessType,
      cacNumber: input.cacNumber.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      country: input.country || "Nigeria",
      companyEmail: input.companyEmail.trim().toLowerCase(),
      companyPhone: input.companyPhone.trim(),
      website: input.website?.trim(),
      description: input.description.trim(),
      logo: input.logo,
      logoTint: "coral",
      logoInitials: input.businessName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      authorizedRepresentative: input.authorizedRepresentative,
      documents: input.documents,
      verificationStatus: "PENDING",
      defaultRevenueSplitPercent: 80,
      createdAt: now,
      updatedAt: now,
    };

    this.partners = [newPartner, ...this.partners];

    let createdAsset: PartnerAsset | undefined;
    if (input.initialAsset && input.initialAsset.name) {
      createdAsset = {
        id: `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        partnerId,
        partnerName: newPartner.businessName,
        name: input.initialAsset.name.trim(),
        category: input.initialAsset.category,
        description: input.initialAsset.description,
        declaredValueKobo: Math.round(input.initialAsset.declaredValueKobo),
        location: input.initialAsset.location,
        condition: input.initialAsset.condition || "Brand new",
        referenceNumber: input.initialAsset.referenceNumber,
        images:
          input.initialAsset.images && input.initialAsset.images.length > 0
            ? input.initialAsset.images
            : ["/mercedes-benz-c-class.png"],
        status: "PENDING_REVIEW",
        createdAt: now,
        updatedAt: now,
      };
      this.assets = [createdAsset, ...this.assets];
    }

    this.logAudit({
      actorId: input.authorizedRepresentative.email,
      actorRole: "partner",
      action: "PARTNER_APPLICATION_SUBMITTED",
      entityType: "partner",
      entityId: partnerId,
      entityName: newPartner.businessName,
    });

    this.persist();

    // Sync to Firestore in background
    try {
      await setDoc(doc(db, "partners", partnerId), newPartner);
      if (createdAsset) {
        await setDoc(doc(db, "partner_assets", createdAsset.id), createdAsset);
      }
    } catch (e) {
      console.warn("Could not sync new partner to Firestore (working offline):", e);
    }

    return { partner: newPartner, asset: createdAsset };
  }

  public updatePartnerStatus(
    partnerId: string,
    status: PartnerStatus,
    adminNotes?: string,
    actorEmail: string = "admin@raffila.com",
  ): PartnerProfile {
    const p = this.partners.find((x) => x.id === partnerId);
    if (!p) throw new Error("Partner not found");

    const now = new Date().toISOString();
    p.verificationStatus = status;
    p.updatedAt = now;
    if (adminNotes !== undefined) {
      p.adminNotes = adminNotes;
    }

    this.logAudit({
      actorId: actorEmail,
      actorRole: "admin",
      action: `PARTNER_${status}`,
      entityType: "partner",
      entityId: partnerId,
      entityName: p.businessName,
      metadata: { adminNotes },
    });

    this.persist();

    // Firestore async update
    try {
      void updateDoc(doc(db, "partners", partnerId), {
        verificationStatus: status,
        adminNotes: p.adminNotes || "",
        updatedAt: now,
      });
    } catch (err) {
      console.warn("Firestore partner update error:", err);
    }

    return { ...p };
  }

  public updatePartnerProfile(partnerId: string, updates: Partial<PartnerProfile>): PartnerProfile {
    const p = this.partners.find((x) => x.id === partnerId);
    if (!p) throw new Error("Partner not found");

    Object.assign(p, updates, { updatedAt: new Date().toISOString() });
    this.persist();

    try {
      void updateDoc(doc(db, "partners", partnerId), updates as any);
    } catch (err) {
      console.warn(err);
    }

    return { ...p };
  }

  // --- Assets CRUD ---
  public getAssets(partnerId?: string): PartnerAsset[] {
    if (partnerId) {
      return this.assets.filter((a) => a.partnerId === partnerId);
    }
    return [...this.assets];
  }

  public submitAsset(
    partnerId: string,
    assetData: Omit<
      PartnerAsset,
      "id" | "partnerId" | "partnerName" | "status" | "createdAt" | "updatedAt"
    >,
  ): PartnerAsset {
    const p = this.partners.find((x) => x.id === partnerId);
    if (!p) throw new Error("Partner not found");

    const now = new Date().toISOString();
    const newAsset: PartnerAsset = {
      id: `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      partnerId,
      partnerName: p.businessName,
      ...assetData,
      status: "PENDING_REVIEW",
      createdAt: now,
      updatedAt: now,
    };

    this.assets = [newAsset, ...this.assets];

    this.logAudit({
      actorId: p.companyEmail,
      actorRole: "partner",
      action: "ASSET_SUBMITTED",
      entityType: "asset",
      entityId: newAsset.id,
      entityName: newAsset.name,
    });

    this.persist();

    try {
      void setDoc(doc(db, "partner_assets", newAsset.id), newAsset);
    } catch (err) {
      console.warn(err);
    }

    return newAsset;
  }

  public updateAssetStatus(
    assetId: string,
    status: AssetStatus,
    adminNotes?: string,
    competitionId?: string,
    competitionTitle?: string,
  ): PartnerAsset {
    const a = this.assets.find((x) => x.id === assetId);
    if (!a) throw new Error("Asset not found");

    a.status = status;
    a.updatedAt = new Date().toISOString();
    if (adminNotes !== undefined) a.adminNotes = adminNotes;
    if (competitionId !== undefined) a.competitionId = competitionId;
    if (competitionTitle !== undefined) a.competitionTitle = competitionTitle;

    this.persist();

    try {
      void updateDoc(doc(db, "partner_assets", assetId), {
        status,
        adminNotes: a.adminNotes || "",
        competitionId: a.competitionId || "",
        competitionTitle: a.competitionTitle || "",
        updatedAt: a.updatedAt,
      });
    } catch (err) {
      console.warn(err);
    }

    return { ...a };
  }

  // --- Revenue Splits & Competitions ---
  public getRevenueSplit(competitionId: string): RevenueSplitConfig | undefined {
    return this.revenueSplits.find((s) => s.competitionId === competitionId);
  }

  public getRevenueSplits(): RevenueSplitConfig[] {
    return [...this.revenueSplits];
  }

  public configureRevenueSplit(input: {
    competitionId: string;
    partnerId: string;
    partnerPercentage: number;
    rafillaPercentage: number;
    adminEmail?: string;
  }): RevenueSplitConfig {
    const existing = this.revenueSplits.find((s) => s.competitionId === input.competitionId);
    if (existing?.isLocked) {
      throw new Error("Revenue split is locked for this live competition and cannot be modified.");
    }

    const partner = this.partners.find((p) => p.id === input.partnerId);
    const now = new Date().toISOString();

    const config: RevenueSplitConfig = {
      competitionId: input.competitionId,
      partnerId: input.partnerId,
      partnerName: partner?.businessName || input.partnerId,
      partnerPercentage: Number(input.partnerPercentage),
      rafillaPercentage: Number(input.rafillaPercentage),
      effectiveFrom: existing?.effectiveFrom || now,
      isLocked: false,
      createdBy: input.adminEmail || "admin@raffila.com",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (existing) {
      Object.assign(existing, config);
    } else {
      this.revenueSplits.push(config);
    }

    this.logAudit({
      actorId: input.adminEmail || "admin@raffila.com",
      actorRole: "admin",
      action: "REVENUE_SPLIT_CONFIGURED",
      entityType: "revenue_split",
      entityId: input.competitionId,
      metadata: {
        partnerPercentage: input.partnerPercentage,
        rafillaPercentage: input.rafillaPercentage,
      },
    });

    this.persist();
    return config;
  }

  public lockRevenueSplit(competitionId: string, adminEmail: string = "admin@raffila.com") {
    const split = this.revenueSplits.find((s) => s.competitionId === competitionId);
    if (!split) return;
    split.isLocked = true;
    split.lockedAt = new Date().toISOString();
    split.updatedAt = new Date().toISOString();

    this.logAudit({
      actorId: adminEmail,
      actorRole: "admin",
      action: "REVENUE_SPLIT_LOCKED",
      entityType: "revenue_split",
      entityId: competitionId,
      metadata: { partnerPercentage: split.partnerPercentage },
    });

    this.persist();
  }

  // --- Revenue Ledger ---
  public getLedger(partnerId?: string, competitionId?: string): RevenueLedgerEntry[] {
    let list = [...this.ledger];
    if (partnerId) {
      list = list.filter((l) => l.partnerId === partnerId);
    }
    if (competitionId) {
      list = list.filter((l) => l.competitionId === competitionId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordTicketBatchRevenue(input: {
    competitionId: string;
    competitionTitle: string;
    partnerId: string;
    ticketCount: number;
    entryPriceKobo: number;
    reference?: string;
  }): RevenueLedgerEntry {
    const split = this.getRevenueSplit(input.competitionId);
    const partner = this.partners.find((p) => p.id === input.partnerId);

    const partnerPct = split ? split.partnerPercentage : partner?.defaultRevenueSplitPercent || 80;
    const rafillaPct = 100 - partnerPct;

    const calc = calculateCompetitionRevenue(
      input.ticketCount,
      input.entryPriceKobo,
      partnerPct,
      rafillaPct,
    );

    const entry: RevenueLedgerEntry = {
      id: `LEDGER-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`.toUpperCase(),
      competitionId: input.competitionId,
      competitionTitle: input.competitionTitle,
      partnerId: input.partnerId,
      partnerName: partner?.businessName || "Partner",
      batchId: `BATCH-${new Date().toISOString().slice(0, 10)}`,
      ticketCount: input.ticketCount,
      entryPriceKobo: input.entryPriceKobo,
      grossRevenueKobo: calc.grossRevenueKobo,
      partnerPercentage: partnerPct,
      partnerAmountKobo: calc.partnerAmountKobo,
      rafillaPercentage: rafillaPct,
      rafillaAmountKobo: calc.rafillaAmountKobo,
      status: "CONFIRMED",
      timestamp: new Date().toISOString(),
      reference: input.reference || `TX-${Date.now().toString(36)}`,
    };

    this.ledger = [entry, ...this.ledger];
    this.persist();
    return entry;
  }

  // --- Settlements & Payouts ---
  public getPayouts(partnerId?: string): PartnerPayoutRecord[] {
    if (partnerId) {
      return this.payouts.filter((p) => p.partnerId === partnerId);
    }
    return [...this.payouts];
  }

  public updatePayoutStatus(
    payoutId: string,
    status: PartnerPayoutRecord["status"],
    adminEmail: string = "admin@raffila.com",
    notes?: string,
  ): PartnerPayoutRecord {
    const p = this.payouts.find((x) => x.id === payoutId);
    if (!p) throw new Error("Payout not found");

    p.status = status;
    if (notes) p.adminNotes = notes;
    if (status === "APPROVED") {
      p.approvedBy = adminEmail;
      p.approvedAt = new Date().toISOString();
    } else if (status === "PAID") {
      p.paidAt = new Date().toISOString();
    }

    this.logAudit({
      actorId: adminEmail,
      actorRole: "admin",
      action: `PAYOUT_${status}`,
      entityType: "payout",
      entityId: payoutId,
      entityName: `${p.partnerName} - ₦${(p.amountKobo / 100).toLocaleString()}`,
    });

    this.persist();
    return { ...p };
  }

  // --- Summary Metrics ---
  public getPartnerMetrics(partnerId: string) {
    const ledger = this.getLedger(partnerId);
    const partner = this.getPartnerById(partnerId);
    const partnerAssets = this.getAssets(partnerId);

    const totalTicketsSold = ledger.reduce((acc, curr) => acc + curr.ticketCount, 0);
    const totalGrossRevenueKobo = ledger.reduce((acc, curr) => acc + curr.grossRevenueKobo, 0);
    const totalPartnerShareKobo = ledger.reduce((acc, curr) => acc + curr.partnerAmountKobo, 0);
    const totalRafillaShareKobo = ledger.reduce((acc, curr) => acc + curr.rafillaAmountKobo, 0);

    const payouts = this.getPayouts(partnerId);
    const paidAmountKobo = payouts
      .filter((p) => p.status === "PAID")
      .reduce((acc, curr) => acc + curr.amountKobo, 0);
    const pendingPayoutKobo = Math.max(0, totalPartnerShareKobo - paidAmountKobo);

    return {
      partner,
      assetsCount: partnerAssets.length,
      totalTicketsSold,
      totalGrossRevenueKobo,
      totalPartnerShareKobo,
      totalRafillaShareKobo,
      paidAmountKobo,
      pendingPayoutKobo,
    };
  }

  public getPlatformFinancials() {
    const totalGrossRevenueKobo = this.ledger.reduce((acc, curr) => acc + curr.grossRevenueKobo, 0);
    const totalPartnerAllocationsKobo = this.ledger.reduce(
      (acc, curr) => acc + curr.partnerAmountKobo,
      0,
    );
    const totalRafillaRevenueKobo = this.ledger.reduce(
      (acc, curr) => acc + curr.rafillaAmountKobo,
      0,
    );
    const totalTicketsSold = this.ledger.reduce((acc, curr) => acc + curr.ticketCount, 0);

    const paidPartnerKobo = this.payouts
      .filter((p) => p.status === "PAID")
      .reduce((acc, curr) => acc + curr.amountKobo, 0);
    const pendingPartnerKobo = Math.max(0, totalPartnerAllocationsKobo - paidPartnerKobo);

    return {
      totalGrossRevenueKobo,
      totalPartnerAllocationsKobo,
      totalRafillaRevenueKobo,
      totalTicketsSold,
      paidPartnerKobo,
      pendingPartnerKobo,
      activePartnersCount: this.getApprovedPartners().length,
      pendingPartnersCount: this.partners.filter((p) => p.verificationStatus === "PENDING").length,
    };
  }

  // --- Audit Logging ---
  public getAuditLogs(entityId?: string): PartnerAuditLog[] {
    if (entityId) {
      return this.auditLogs.filter((l) => l.entityId === entityId);
    }
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  private logAudit(entry: Omit<PartnerAuditLog, "id" | "timestamp">) {
    const log: PartnerAuditLog = {
      id: `AUDIT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs = [log, ...this.auditLogs].slice(0, 200); // retain last 200 logs
  }
}

// Global Singleton Instance
export const partnerStore = new PartnerStore();
