import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type { FirebaseUser };

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logoutFirebase() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function createUserProfile(uid: string, data: Record<string, unknown>) {
  return setDoc(doc(db, "users", uid), { ...data, createdAt: serverTimestamp() }, { merge: true });
}

export function firebaseUserToRaffilaUser(fbUser: FirebaseUser, profile?: Record<string, unknown>) {
  const displayName = fbUser.displayName || "";
  const parts = displayName.split(" ");
  const firstName = (parts[0] || "") as string;
  const lastName = (parts.slice(1).join(" ") || "") as string;
  const handle = (profile?.["handle"] as string) || firstName.toLowerCase().replace(/\s+/g, "_");

  return {
    id: fbUser.uid,
    role: ((profile?.["role"] as string) || "user") as "user" | "admin",
    firstName,
    lastName,
    handle,
    email: fbUser.email || "",
    phone: (profile?.["phone"] as string) || "",
    avatarMonogram: (profile?.["avatarMonogram"] as string) || ((firstName + lastName).toUpperCase() || "U"),
    verified: Boolean(profile?.["verified"]),
    isGoogleUser: !fbUser.email || fbUser.providerData.some((p) => p.providerId === "google.com"),
    profileComplete: Boolean(profile?.["phone"] && profile?.["address"] && profile?.["dob"]),
  } as const;
}
