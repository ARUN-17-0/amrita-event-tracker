import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

// Primary app — persists the admin session normally
const app = isMock ? null : initializeApp(firebaseConfig);
const auth = isMock ? null : getAuth(app!);
const db   = isMock ? null : getFirestore(app!);

// Secondary app — ONLY used for creating new Auth users.
// Uses inMemoryPersistence so it never touches localStorage
// and can never interfere with the admin's session.
let secondaryAuth: ReturnType<typeof getAuth> | null = null;
if (!isMock) {
  const existing = getApps().find(a => a.name === 'secondary');
  const secondaryApp = existing ?? initializeApp(firebaseConfig, 'secondary');
  secondaryAuth = getAuth(secondaryApp);
  // Fire-and-forget — set memory persistence so no localStorage is written
  setPersistence(secondaryAuth, inMemoryPersistence).catch(() => {});
}

export { app, auth, db, secondaryAuth };
