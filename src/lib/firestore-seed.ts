import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { winnerCards, partners, REWARD_POOL } from "./raffila-data";

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

    // 4. Competitions are NOT seeded.
    // There is no hardcoded catalogue any more: a competition exists only if an
    // operator created it in the admin dashboard. Seeding fixtures here is what
    // made deleted competitions reappear, so this step is intentionally absent.

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
      count: winnerCards.length,
      total: winnerCards.length,
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
