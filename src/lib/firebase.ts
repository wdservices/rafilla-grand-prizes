import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

function getEnv(val?: string, fallback?: string): string {
  if (
    !val ||
    val.includes("your_firebase") ||
    val === "rafilla" ||
    val.includes("000000000000") ||
    val === "123456789012"
  ) {
    return fallback || "";
  }
  return val;
}

const envApiKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_API_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY);

const envAuthDomain =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
  (typeof process !== "undefined" && process.env?.VITE_FIREBASE_AUTH_DOMAIN);

const envProjectId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
  (typeof process !== "undefined" && process.env?.VITE_FIREBASE_PROJECT_ID);

const envStorageBucket =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
  (typeof process !== "undefined" && process.env?.VITE_FIREBASE_STORAGE_BUCKET);

const envMessagingSenderId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
  (typeof process !== "undefined" && process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID);

const envAppId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_APP_ID) ||
  (typeof process !== "undefined" && process.env?.VITE_FIREBASE_APP_ID);

export const firebaseConfig = {
  apiKey: getEnv(envApiKey, "AIzaSyABJbHH3mIpIyZUpBSNXK4HCFTP1t4V0J0"),
  authDomain: getEnv(envAuthDomain, "raffila-44282.firebaseapp.com"),
  projectId: getEnv(envProjectId, "raffila-44282"),
  storageBucket: getEnv(envStorageBucket, "raffila-44282.firebasestorage.app"),
  messagingSenderId: getEnv(envMessagingSenderId, "677655084102"),
  appId: getEnv(envAppId, "1:677655084102:web:8bde804fc7d1d970e89e47"),
};

// Initialize Firebase safely for both client and SSR environments
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
