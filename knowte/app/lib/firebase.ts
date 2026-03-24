"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";

type FirebaseConfig = {
  apiKey: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

function getFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomainFromEnv = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const authDomain = authDomainFromEnv || (projectId ? `${projectId}.firebaseapp.com` : undefined);

  const missing = [
    !apiKey && "NEXT_PUBLIC_FIREBASE_API_KEY",
    !authDomain && "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)",
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    throw new Error(`Missing Firebase env vars: ${missing.join(", ")}`);
  }

  return {
    apiKey: apiKey ?? "",
    authDomain,
    projectId,
    appId,
    storageBucket,
    messagingSenderId,
  };
}

function getFirebaseApp() {
  const existing = getApps();
  if (existing.length > 0) return getApp();
  return initializeApp(getFirebaseConfig());
}

export async function signInWithGooglePopup(): Promise<string> {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential: UserCredential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}

