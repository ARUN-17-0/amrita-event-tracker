import { UserProfile } from '../types';
import { mockFaculty } from '../mock/data';
import { db, secondaryAuth } from '../config/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memoryFaculty = [...mockFaculty];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<UserProfile[]> => { await delay(100); return [...memoryFaculty]; },
  getById: async (uid: string): Promise<UserProfile | null> => { await delay(50); return memoryFaculty.find(f => f.uid === uid) || null; },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> => {
    await delay(100);
    const newFac: UserProfile = { ...data, uid: `fac-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    memoryFaculty.push(newFac);
    return newFac;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memoryFaculty.findIndex(f => f.uid === uid);
    if (index === -1) throw new Error('Not found');
    memoryFaculty[index] = { ...memoryFaculty[index], ...data, updatedAt: new Date() };
  },
  delete: async (uid: string): Promise<void> => {
    await delay(100);
    memoryFaculty = memoryFaculty.filter(f => f.uid !== uid);
  }
};

const firebaseService = {
  getAll: async (): Promise<UserProfile[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(query(collection(db, 'profiles'), where('role', 'in', ['faculty', 'course_mentor', 'admin'])));
    return qs.docs.map(d => ({ ...d.data(), uid: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as UserProfile));
  },
  getById: async (uid: string): Promise<UserProfile | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? { ...snap.data(), uid: snap.id, createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as UserProfile : null;
  },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'> & { password?: string }): Promise<UserProfile> => {
    if (!db || !secondaryAuth) throw new Error('No FB');
    const password = (data as any).password || 'Amrita@123';
    const { password: _pw, ...profileData } = data as any;
    let uid: string;
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
      await signOut(secondaryAuth);
      uid = cred.user.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Auth account exists (e.g. previously deleted profile) — find it and reuse
        const existing = await getDocs(query(collection(db, 'profiles'), where('email', '==', data.email)));
        if (!existing.empty) {
          uid = existing.docs[0].id;
        } else {
          // Auth exists but no profile — sign in to get UID
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const cred = await signInWithEmailAndPassword(secondaryAuth, data.email, password);
          await signOut(secondaryAuth);
          uid = cred.user.uid;
        }
      } else {
        throw err;
      }
    }
    const profile: UserProfile = { ...profileData, uid, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    await setDoc(doc(db, 'profiles', uid), { ...profile, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return profile;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'profiles', uid), { ...data, updatedAt: Timestamp.now() });
  },
  delete: async (uid: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    await deleteDoc(doc(db, 'profiles', uid));
  }
};

export const facultyService = isMock ? mockService : firebaseService;
