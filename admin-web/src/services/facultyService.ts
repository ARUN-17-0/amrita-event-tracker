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
    // Create Firebase Auth user via secondary app (doesn't displace admin session)
    const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
    await signOut(secondaryAuth);
    const uid = cred.user.uid;
    const { password: _pw, ...profileData } = data as any;
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
