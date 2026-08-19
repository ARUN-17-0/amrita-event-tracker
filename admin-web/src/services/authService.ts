import { UserProfile } from '../types';
import { mockAdmin, mockDemoAccounts } from '../mock/data';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Runtime store for newly created accounts (mock mode only)
const runtimeCredentials = new Map<string, { user: UserProfile; password: string }>();

export function registerMockCredential(user: UserProfile, password: string) {
  runtimeCredentials.set(user.email.toLowerCase(), { user, password });
}

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
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    await delay(50);
    const all = Object.values(mockDemoAccounts).map(a => a.user);
    return all.find(u => u.uid === uid) ?? null;
  }
};

const firebaseAuthService = {
  login: async (email: string, password: string): Promise<UserProfile> => {
    if (!auth || !db) throw new Error('Firebase not initialized');
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const docRef = doc(db, 'profiles', userCred.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as UserProfile;
    throw new Error('User profile not found');
  },
  logout: async (): Promise<void> => {
    if (!auth) throw new Error('Firebase not initialized');
    await signOut(auth);
  },
  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (!auth || !db) return null;
    const user = auth.currentUser;
    if (!user) return null;
    const docRef = doc(db, 'profiles', user.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  },
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    if (!db) return null;
    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  }
};

export const authService = isMock ? mockAuthService : firebaseAuthService;

// Keep backward-compatible named export
export { mockAdmin };
