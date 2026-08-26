import { UserProfile } from '../types';
import { mockAdmin, mockDemoAccounts } from '../mock/data';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Runtime store for mock-mode newly-created accounts ──────────────────────
const runtimeCredentials = new Map<string, { user: UserProfile; password: string }>();

export function registerMockCredential(user: UserProfile, password: string) {
  runtimeCredentials.set(user.email.toLowerCase(), { user, password });
}

// ── MOCK AUTH ────────────────────────────────────────────────────────────────
const mockAuthService = {
  login: async (email: string, password: string): Promise<UserProfile> => {
    await delay(500);
    const emailLower = email.toLowerCase();
    const account = mockDemoAccounts[emailLower] ?? runtimeCredentials.get(emailLower);
    if (account && account.password === password) {
      localStorage.setItem('aet_user', JSON.stringify(account.user));
      return account.user;
    }
    throw new Error('Invalid email or password');
  },
  logout: async (): Promise<void> => {
    await delay(100);
    localStorage.removeItem('aet_user');
  },
  getCurrentUser: async (): Promise<UserProfile | null> => {
    await delay(50);
    const raw = localStorage.getItem('aet_user');
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  },
  onAuthStateChanged: (callback: (user: UserProfile | null) => void): (() => void) => {
    const raw = localStorage.getItem('aet_user');
    callback(raw ? (JSON.parse(raw) as UserProfile) : null);
    return () => {};
  },
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    await delay(50);
    const all = Object.values(mockDemoAccounts).map(a => a.user);
    return all.find(u => u.uid === uid) ?? null;
  }
};

// ── FIREBASE AUTH ────────────────────────────────────────────────────────────
const firebaseAuthService = {
  login: async (email: string, password: string): Promise<UserProfile> => {
    if (!auth || !db) throw new Error('Firebase not initialised');
    const emailClean = email.toLowerCase().trim();

    try {
      const cred = await signInWithEmailAndPassword(auth, emailClean, password);
      const snap = await getDoc(doc(db, 'profiles', cred.user.uid));
      if (snap.exists()) return { ...snap.data(), uid: cred.user.uid } as UserProfile;

      // Check if a profile was imported by email with a generated doc ID
      const qs = await getDocs(query(collection(db, 'profiles'), where('email', '==', emailClean)));
      if (!qs.empty) {
        const existingDoc = qs.docs[0];
        const existingData = existingDoc.data();
        const updatedProfile = {
          ...existingData,
          uid: cred.user.uid,
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'profiles', cred.user.uid), updatedProfile);
        if (existingDoc.id !== cred.user.uid) {
          try { await deleteDoc(existingDoc.ref); } catch {}
        }
        return { ...updatedProfile, uid: cred.user.uid } as UserProfile;
      }

      // Profile doesn't exist yet — create a minimal one
      const profile: UserProfile = {
        uid: cred.user.uid,
        fullName: cred.user.displayName || emailClean.split('@')[0],
        email: cred.user.email || emailClean,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(doc(db, 'profiles', cred.user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return profile;
    } catch (authErr: any) {
      // If user is not yet provisioned in Auth, check Firestore profile for first-time sign in
      if (
        authErr.code === 'auth/user-not-found' ||
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const qs = await getDocs(query(collection(db, 'profiles'), where('email', '==', emailClean)));
          if (!qs.empty) {
            const profileDoc = qs.docs[0];
            const profileData = profileDoc.data() as any;
            const expectedPw = profileData.initialPassword || 'Amrita@123';
            
            if (password === expectedPw) {
              const newCred = await createUserWithEmailAndPassword(auth, emailClean, password);
              const updatedProfile = {
                ...profileData,
                uid: newCred.user.uid,
                updatedAt: serverTimestamp()
              };
              delete updatedProfile.initialPassword;
              await setDoc(doc(db, 'profiles', newCred.user.uid), updatedProfile);
              if (profileDoc.id !== newCred.user.uid) {
                try { await deleteDoc(profileDoc.ref); } catch {}
              }
              return { ...updatedProfile, uid: newCred.user.uid } as UserProfile;
            }
          }
        } catch {
          // Fall through to throw original authErr
        }
      }
      throw authErr;
    }
  },
  logout: async (): Promise<void> => {
    if (!auth) throw new Error('Firebase not initialised');
    await signOut(auth);
  },
  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (!auth || !db) return null;
    return new Promise(resolve => {
      const unsub = onAuthStateChanged(auth!, async (fbUser) => {
        unsub();
        if (!fbUser) { resolve(null); return; }
        const snap = await getDoc(doc(db!, 'profiles', fbUser.uid));
        if (snap.exists()) resolve({ ...snap.data(), uid: fbUser.uid } as UserProfile);
        else resolve(null);
      });
    });
  },
  onAuthStateChanged: (callback: (user: UserProfile | null) => void): (() => void) => {
    if (!auth || !db) { callback(null); return () => {}; }
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { callback(null); return; }
      const snap = await getDoc(doc(db!, 'profiles', fbUser.uid));
      if (snap.exists()) callback({ ...snap.data(), uid: fbUser.uid } as UserProfile);
      else callback(null);
    });
  },
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    if (!db) return null;
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? { ...snap.data(), uid } as UserProfile : null;
  }
};

export const authService = isMock ? mockAuthService : firebaseAuthService;
export { mockAdmin };
