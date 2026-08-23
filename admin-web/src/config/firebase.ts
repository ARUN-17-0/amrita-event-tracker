import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

// Primary app — used for the signed-in admin session
const app = isMock ? null : initializeApp(firebaseConfig);
const auth = isMock ? null : getAuth(app!);
const db = isMock ? null : getFirestore(app!);

// Secondary app — used ONLY for creating new Auth users
// so the admin's own session is never displaced.
let secondaryAuth: ReturnType<typeof getAuth> | null = null;
if (!isMock) {
  const existing = getApps().find(a => a.name === 'secondary');
  const secondaryApp = existing ?? initializeApp(firebaseConfig, 'secondary');
  secondaryAuth = getAuth(secondaryApp);
}

export { app, auth, db, secondaryAuth };
