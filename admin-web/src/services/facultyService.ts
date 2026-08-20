import { UserProfile } from '../types';
import { mockFaculty } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';

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
    const qs = await getDocs(query(collection(db, 'profiles'), where('role', '==', 'faculty')));
    return qs.docs.map(d => ({ ...d.data(), uid: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as UserProfile));
  },
  getById: async (uid: string): Promise<UserProfile | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? { ...snap.data(), uid: snap.id, createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as UserProfile : null;
  },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> => {
    // In a real app, you would create auth user then profile
    if (!db) throw new Error('No FB');
    const uid = `temp-${Date.now()}`;
    const newFac = { ...data, role: 'faculty', createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
    await setDoc(doc(db, 'profiles', uid), newFac);
    return { ...data, uid, createdAt: new Date(), updatedAt: new Date() } as UserProfile;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'profiles', uid), { ...data, updatedAt: Timestamp.now() });
  },
  delete: async (uid: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'profiles', uid));
  }
};
export const facultyService = isMock ? mockService : firebaseService;
