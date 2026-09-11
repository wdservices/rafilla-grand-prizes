import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

export const DEFAULT_PRIMARY_ADMIN_EMAIL = "raffilamarketplace@gmail.com";

export const BACKUP_ADMIN_EMAILS: string[] = [
  "spellz49@gmail.com",
  "admin@raffila.com",
  "admin_aisha@raffila.com",
  "aisha.olamide@raffila.com",
];

const LOCAL_STORAGE_KEY = "raffila:admin:custom_email";
const FIRESTORE_COLLECTION = "platformSettings";
const FIRESTORE_DOC_ID = "admin_config";

// In-memory cache initialized from localStorage or default
let cachedAdminEmail: string = (function () {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored && stored.includes("@")) {
        return stored.trim().toLowerCase();
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_PRIMARY_ADMIN_EMAIL;
})();

export function getPrimaryAdminEmail(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored && stored.includes("@")) {
        cachedAdminEmail = stored.trim().toLowerCase();
      }
    } catch {
      // ignore
    }
  }
  return cachedAdminEmail || DEFAULT_PRIMARY_ADMIN_EMAIL;
}

export function getAllAdminEmails(): string[] {
  const primary = getPrimaryAdminEmail();
  const list = new Set<string>();
  list.add(DEFAULT_PRIMARY_ADMIN_EMAIL.toLowerCase());
  if (primary) list.add(primary.toLowerCase());
  for (const email of BACKUP_ADMIN_EMAILS) {
    list.add(email.toLowerCase());
  }

  // Check env vars
  const envValues = [
    typeof import.meta !== "undefined" ? (import.meta.env?.VITE_ADMIN_EMAIL as string) : undefined,
    typeof import.meta !== "undefined" ? (import.meta.env?.VITE_ADMIN_EMAILS as string) : undefined,
    typeof process !== "undefined" ? process.env?.VITE_ADMIN_EMAIL : undefined,
    typeof process !== "undefined" ? process.env?.VITE_ADMIN_EMAILS : undefined,
  ];

  for (const val of envValues) {
    if (typeof val === "string" && val.trim()) {
      const parts = val.split(/[,;\s]+/).map((s) => s.trim().toLowerCase());
      for (const p of parts) {
        if (p && p.includes("@")) list.add(p);
      }
    }
  }

  return Array.from(list);
}

export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const allAdmins = getAllAdminEmails();
  if (allAdmins.includes(clean)) return true;
  if (clean.startsWith("admin@") || clean.includes("+admin@")) return true;
  return false;
}

export async function setAdminEmail(
  newEmail: string,
  updatedBy?: string,
): Promise<{ success: boolean; email: string }> {
  const clean = newEmail.trim().toLowerCase();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw new Error("Please provide a valid email address.");
  }

  cachedAdminEmail = clean;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, clean);
      window.dispatchEvent(new CustomEvent("raffila:admin-email-changed", { detail: clean }));
    } catch (e) {
      console.warn("Could not write admin email to localStorage:", e);
    }
  }

  // Persist to Cloud Firestore
  try {
    const ref = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    await setDoc(
      ref,
      {
        adminEmail: clean,
        updatedAt: serverTimestamp(),
        updatedBy: updatedBy || "admin",
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Could not persist admin email to Firestore:", err);
  }

  return { success: true, email: clean };
}

export async function resetAdminEmailToDefault(): Promise<string> {
  await setAdminEmail(DEFAULT_PRIMARY_ADMIN_EMAIL, "admin_reset");
  return DEFAULT_PRIMARY_ADMIN_EMAIL;
}

export function useAdminEmailConfig() {
  const [adminEmail, setAdminEmailState] = useState<string>(getPrimaryAdminEmail());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setAdminEmailState(getPrimaryAdminEmail());

    const handleLocalChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setAdminEmailState(customEvent.detail);
      }
    };
    window.addEventListener("raffila:admin-email-changed", handleLocalChange);

    let unsubscribe: (() => void) | undefined;
    try {
      const ref = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      unsubscribe = onSnapshot(
        ref,
        (snap) => {
          setLoading(false);
          if (snap.exists()) {
            const data = snap.data();
            if (
              data &&
              typeof data["adminEmail"] === "string" &&
              data["adminEmail"].includes("@")
            ) {
              const remoteEmail = data["adminEmail"].trim().toLowerCase();
              cachedAdminEmail = remoteEmail;
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, remoteEmail);
              } catch {
                // ignore
              }
              setAdminEmailState(remoteEmail);
            }
          }
        },
        (err) => {
          console.warn("Firestore admin email listener notice:", err);
          setLoading(false);
        },
      );
    } catch {
      setLoading(false);
    }

    return () => {
      window.removeEventListener("raffila:admin-email-changed", handleLocalChange);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { adminEmail, loading, setAdminEmail, resetAdminEmailToDefault };
}
