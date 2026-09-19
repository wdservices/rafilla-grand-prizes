import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { competitions, winnerCards, partners, REWARD_POOL } from "./raffila-data";

export interface SeedProgress {
  stage: string;
  count: number;
  total: number;
  completed: boolean;
  error?: string;
}

export const SEED_USERS = [
  {
    id: "usr_tunmise_adebayo_001",
    email: "tunmise.adebayo@raffila.com",
    displayName: "Tunmise Adebayo",
    handle: "tunmise_adebayo",
    role: "user",
    phone: "+234 801 234 5678",
    avatarMonogram: "TA",
    walletBalanceKobo: 5000000, // ₦50,000
    referralEarningsKobo: 1250000, // ₦12,500
    referralCode: "RAF-TUNMISE",
    verified: true,
    createdAt: new Date("2026-01-15T10:00:00Z").toISOString(),
  },
  {
    id: "usr_chioma_okeke_002",
    email: "chioma.okeke@raffila.com",
    displayName: "Chioma Okeke",
    handle: "chioma_okeke",
    role: "user",
    phone: "+234 802 987 6543",
    avatarMonogram: "CO",
    walletBalanceKobo: 8200000,
    referralEarningsKobo: 450000,
    referralCode: "RAF-CHIOMA",
    verified: true,
    createdAt: new Date("2026-02-01T12:00:00Z").toISOString(),
  },
  {
    id: "usr_emeka_nwosu_003",
    email: "emeka.nwosu@raffila.com",
    displayName: "Emeka Nwosu",
    handle: "emeka_nwosu",
    role: "user",
    phone: "+234 803 112 2334",
    avatarMonogram: "EN",
    walletBalanceKobo: 15000000,
    referralEarningsKobo: 2100000,
    referralCode: "RAF-EMEKA",
    verified: true,
    createdAt: new Date("2026-02-14T09:30:00Z").toISOString(),
  },
  {
    id: "usr_amina_bello_004",
    email: "amina.bello@raffila.com",
    displayName: "Amina Bello",
    handle: "amina_bello",
    role: "user",
    phone: "+234 805 443 3221",
    avatarMonogram: "AB",
    walletBalanceKobo: 3400000,
    referralEarningsKobo: 800000,
    referralCode: "RAF-AMINA",
    verified: true,
    createdAt: new Date("2026-03-01T14:15:00Z").toISOString(),
  },
  {
    id: "adm_aisha_ola_001",
    email: "admin@raffila.com",
    displayName: "Aisha Olamide",
    handle: "admin_aisha",
    role: "admin",
    phone: "+234 802 345 6789",
    avatarMonogram: "AO",
    walletBalanceKobo: 0,
    referralEarningsKobo: 0,
    referralCode: "RAF-ADMIN",
    verified: true,
    createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

export async function seedFirestoreDatabase(
  onProgress?: (progress: SeedProgress) => void,
): Promise<{ success: boolean; stats: Record<string, number>; error?: string }> {
  const stats: Record<string, number> = {
    competitions: 0,
    draws: 0,
    tickets: 0,
    users: 0,
    winners: 0,
    partners: 0,
    platformSettings: 0,
  };

  try {
    // 1. Seed Platform Settings
    onProgress?.({
      stage: "Platform Settings & Community Pool",
      count: 0,
      total: 1,
      completed: false,
    });
    const poolBatch = writeBatch(db);
    poolBatch.set(doc(db, "platformSettings", "rewardPool"), {
      totalKobo: REWARD_POOL.totalKobo,
      label: REWARD_POOL.label,
      seasonLabel: REWARD_POOL.seasonLabel,
      updatedAt: new Date().toISOString(),
    });
    await poolBatch.commit();
    stats.platformSettings = 1;

    // 2. Seed Users
    onProgress?.({
      stage: "User Accounts & Profiles",
      count: 0,
      total: SEED_USERS.length,
      completed: false,
    });
    const userBatch = writeBatch(db);
    for (const u of SEED_USERS) {
      userBatch.set(doc(db, "users", u.id), u);
      stats.users++;
    }
    await userBatch.commit();

    // 3. Seed Partners
    onProgress?.({
      stage: "Partner Organizations",
      count: 0,
      total: partners.length,
      completed: false,
    });
    const partnerBatch = writeBatch(db);
    for (const p of partners) {
      const partnerDocId = p.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      partnerBatch.set(doc(db, "partner_profiles", partnerDocId), {
        businessName: p,
        verificationStatus: "APPROVED",
        createdAt: new Date().toISOString(),
      });
      stats.partners++;
    }
    await partnerBatch.commit();

    // 4. Seed Competitions and Raffle Draws
    onProgress?.({
      stage: "Competitions & Raffle Draws",
      count: 0,
      total: competitions.length,
      completed: false,
    });

    for (let i = 0; i < competitions.length; i++) {
      const c = competitions[i];
      const compBatch = writeBatch(db);

      // Main competition document
      const compRef = doc(db, "competitions", c.slug);
      compBatch.set(compRef, {
        slug: c.slug,
        title: c.title,
        category: c.category,
        partner: c.partner,
        description: c.description,
        prizeValueKobo: c.prizeValueKobo,
        entryPrice: c.entryPrice,
        totalEntries: c.totalEntries,
        entriesSold: c.entriesSold,
        closes: c.closes,
        daysUntilClose: c.daysUntilClose,
        status: c.status,
        featured: c.featured || false,
        image: typeof c.image === "string" ? c.image : "",
        imageAlt: c.imageAlt,
        accent: c.accent,
        specs: c.specs,
        drawDate: c.drawDate,
        prizeCondition: c.prizeCondition,
        warranty: c.warranty,
        make: c.make,
        model: c.model,
        year: c.year,
        inclusions: c.inclusions,
        exclusions: c.exclusions,
        updatedAt: new Date().toISOString(),
      });
      stats.competitions++;

      // Raffle Draw Document (Cryptographic Fair Draw Schema)
      const drawRef = doc(db, "draws", c.slug);
      const isCompleted = c.status === "COMPLETED";
      const sampleWinner = SEED_USERS[i % (SEED_USERS.length - 1)]; // Don't pick admin
      const winningTicketNum = String(1000 + ((i * 3821) % 9000)).padStart(6, "0");

      compBatch.set(drawRef, {
        competitionSlug: c.slug,
        competitionTitle: c.title,
        status: isCompleted ? "VERIFIED" : "SCHEDULED",
        drawDate: c.drawDate,
        totalEligibleTickets: c.entriesSold,
        algorithm: "HMAC-SHA256::NIST-Beacon-v2",
        algorithmSalt: `raffila-draw-v1::${c.slug}::t-5-snapshot`,
        snapshotHash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8${i.toString(16).padStart(2, "0")}`,
        beaconSeed: `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a${i.toString(16).padStart(2, "0")}`,
        winningTicketNumber: isCompleted ? winningTicketNum : null,
        winnerUserId: isCompleted ? sampleWinner.id : null,
        winnerName: isCompleted ? sampleWinner.displayName : null,
        winnerHandle: isCompleted ? sampleWinner.handle : null,
        verifiedChecks: [true, true, true, true, true],
        publicAuditUrl: `/draw-verification/${c.slug}`,
        createdAt: new Date().toISOString(),
      });
      stats.draws++;

      // Seed representative sample tickets for this draw with user information
      const ticketCountToSeed = Math.min(5, c.entriesSold > 0 ? c.entriesSold : 3);
      for (let t = 1; t <= ticketCountToSeed; t++) {
        const assignedUser = SEED_USERS[(i + t) % (SEED_USERS.length - 1)];
        const ticketNum = String(t * 1000 + i * 42).padStart(6, "0");
        const ticketRef = doc(db, "competitions", c.slug, "tickets", `TKT-${ticketNum}`);
        compBatch.set(ticketRef, {
          ticketNumber: ticketNum,
          ticketCode: `TKT-${ticketNum}`,
          competitionSlug: c.slug,
          userId: assignedUser.id,
          userName: assignedUser.displayName,
          userHandle: assignedUser.handle,
          userEmail: assignedUser.email,
          purchasedAt: new Date(Date.now() - t * 3600000 * 24).toISOString(),
          status: isCompleted && ticketNum === winningTicketNum ? "WINNER" : "ACTIVE",
        });
        stats.tickets++;
      }

      await compBatch.commit();
      onProgress?.({
        stage: `Seeded competition: ${c.title}`,
        count: i + 1,
        total: competitions.length,
        completed: false,
      });
    }

    // 5. Seed Past Winners
    onProgress?.({
      stage: "Verified Past Winners",
      count: 0,
      total: winnerCards.length,
      completed: false,
    });
    const winnerBatch = writeBatch(db);
    for (let w = 0; w < winnerCards.length; w++) {
      const win = winnerCards[w];
      const winRef = doc(db, "winners", win.id || `winner-${w + 1}`);
      winnerBatch.set(winRef, {
        id: win.id || `winner-${w + 1}`,
        competitionTitle: win.competition,
        winnerName: win.winnerName,
        prize: win.prize,
        location: win.location,
        drawDate: win.drawDate,
        amount: win.amount,
        claimStatus: "DISBURSED",
        verified: true,
        createdAt: new Date().toISOString(),
      });
      stats.winners++;
    }
    await winnerBatch.commit();

    onProgress?.({
      stage: "Database Seeding Completed Successfully!",
      count: competitions.length,
      total: competitions.length,
      completed: true,
    });

    return { success: true, stats };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    onProgress?.({
      stage: "Error seeding database",
      count: 0,
      total: 0,
      completed: false,
      error: errorMsg,
    });
    return { success: false, stats, error: errorMsg };
  }
}

export async function checkFirestoreStatus(): Promise<{
  connected: boolean;
  competitionsCount: number;
  usersCount: number;
  drawsCount: number;
  error?: string;
}> {
  try {
    const [compSnap, userSnap, drawSnap] = await Promise.all([
      getDocs(collection(db, "competitions")),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "draws")),
    ]);

    return {
      connected: true,
      competitionsCount: compSnap.size,
      usersCount: userSnap.size,
      drawsCount: drawSnap.size,
    };
  } catch (err: any) {
    return {
      connected: false,
      competitionsCount: 0,
      usersCount: 0,
      drawsCount: 0,
      error: err?.message || String(err),
    };
  }
}
