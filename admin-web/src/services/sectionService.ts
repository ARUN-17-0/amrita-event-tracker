import { Section } from '../types';
import { mockSections } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memorySections = [...mockSections];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<Section[]> => { await delay(100); return [...memorySections]; },
  getById: async (id: string): Promise<Section | null> => { await delay(50); return memorySections.find(s => s.id === id) || null; },
  create: async (data: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
    await delay(100);
    const newSec: Section = { ...data, id: `sec-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    memorySections.push(newSec);
    return newSec;
  },
  update: async (id: string, data: Partial<Omit<Section, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memorySections.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Not found');
    memorySections[index] = { ...memorySections[index], ...data, updatedAt: new Date() };
  },
  assignCR: async (sectionId: string, userId: string): Promise<void> => {
    await delay(100);
    const index = memorySections.findIndex(s => s.id === sectionId);
    if (index !== -1) memorySections[index] = { ...memorySections[index], crUserId: userId, updatedAt: new Date() };
  },
  removeCR: async (sectionId: string): Promise<void> => {
    await delay(100);
    const index = memorySections.findIndex(s => s.id === sectionId);
    if (index !== -1) memorySections[index] = { ...memorySections[index], crUserId: undefined, updatedAt: new Date() };
  }
};

const firebaseService = {
  getAll: async (): Promise<Section[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(collection(db, 'sections'));
    return qs.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as Section));
  },
  getById: async (id: string): Promise<Section | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'sections', id));
    return snap.exists() ? { ...snap.data(), id: snap.id, createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as Section : null;
  },
  create: async (data: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
    if (!db) throw new Error('No FB');
    const ref = await addDoc(collection(db, 'sections'), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return { ...data, id: ref.id, createdAt: new Date(), updatedAt: new Date() } as Section;
  },
  update: async (id: string, data: Partial<Omit<Section, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'sections', id), { ...data, updatedAt: Timestamp.now() });
  },
  assignCR: async (sectionId: string, userId: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'sections', sectionId), { crUserId: userId, updatedAt: Timestamp.now() });
  },
  removeCR: async (sectionId: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'sections', sectionId), { crUserId: null, updatedAt: Timestamp.now() });
  }
};
export const sectionService = isMock ? mockService : firebaseService;
